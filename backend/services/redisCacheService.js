import Redis from "ioredis";
import cron from "node-cron";
import Training from "../models/Training.js";
import {
  checkSolvedProblems,
  calculatePoints,
  getContestStandings as fetchCFStandings,
} from "./codeforcesService.js";

const redis = new Redis(process.env.REDIS_URL, {
  tls: {}, // required for Upstash (enables secure SSL)
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

// Default TTL (Time To Live) - 24 hours in seconds
const DEFAULT_TTL = 24 * 60 * 60;

/**
 * Generate cache key
 */
const generateCacheKey = (type, trainingId, itemId = null) => {
  if (itemId) {
    return `standings:${type}:${trainingId}:${itemId}`;
  }
  return `standings:${type}:${trainingId}`;
};

/**
 * Calculate camp penalty for a problem
 * Camp penalty formula:
 * - First wrong submission: no increase (0)
 * - Second wrong submission: +2
 * - Third wrong submission: +4 (2*2)
 * - Fourth wrong submission: +8 (4*2)
 * - And so on (each is previous * 2)
 * 
 * @param {number} rejectedAttemptCount - Number of wrong submissions before solving
 * @param {number} bestSubmissionTimeSeconds - Time when problem was solved (in seconds)
 * @returns {number} - Calculated penalty in minutes
 */
const calculateCampPenalty = (rejectedAttemptCount, bestSubmissionTimeSeconds) => {
  // Convert time to minutes (Codeforces penalty is in minutes)
  const timePenalty = Math.floor(bestSubmissionTimeSeconds / 60);
  
  // Calculate wrong submission penalty
  let wrongSubmissionPenalty = 0;
  if (rejectedAttemptCount > 0) {
    // First wrong: 0, Second: 2, Third: 4, Fourth: 8, etc.
    // Pattern: 0, 2, 4, 8, 16, 32...
    // For rejectedAttemptCount = 1: penalty = 0
    // For rejectedAttemptCount = 2: penalty = 2
    // For rejectedAttemptCount = 3: penalty = 2 + 4 = 6
    // For rejectedAttemptCount = 4: penalty = 2 + 4 + 8 = 14
    // etc.
    
    if (rejectedAttemptCount === 1) {
      wrongSubmissionPenalty = 0;
    } else {
      // Start from second wrong submission
      let penalty = 0;
      let increment = 2; // Second wrong is +2
      
      for (let i = 2; i <= rejectedAttemptCount; i++) {
        penalty += increment;
        increment *= 2; // Each subsequent wrong doubles the increment
      }
      
      wrongSubmissionPenalty = penalty;
    }
  }
  
  return timePenalty + wrongSubmissionPenalty;
};

/**
 * Recalculate penalty for camp type training
 * @param {Array} problemResults - Array of problem results from Codeforces
 * @param {number} originalPenalty - Original penalty from Codeforces
 * @returns {number} - Recalculated penalty for camp
 */
const recalculateCampPenalty = (problemResults, originalPenalty) => {
  let totalPenalty = 0;
  
  for (const problemResult of problemResults) {
    // Only calculate penalty for solved problems
    if (problemResult.points > 0 && problemResult.bestSubmissionTimeSeconds) {
      const problemPenalty = calculateCampPenalty(
        problemResult.rejectedAttemptCount || 0,
        problemResult.bestSubmissionTimeSeconds
      );
      totalPenalty += problemPenalty;
    }
  }
  
  return totalPenalty;
};

/**
 * Get data from cache
 */
export const getFromCache = async (key) => {
  try {
    const data = await redis.get(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
};

/**
 * Set data in cache with TTL
 */
export const setInCache = async (key, data, ttl = DEFAULT_TTL) => {
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Cache set error:", error);
    return false;
  }
};

/**
 * Delete specific cache key
 */
export const deleteFromCache = async (key) => {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error("Cache delete error:", error);
    return false;
  }
};

/**
 * Clear all cache keys matching pattern
 */
export const clearCachePattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      return keys.length;
    }
    return 0;
  } catch (error) {
    console.error("Cache clear pattern error:", error);
    return 0;
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = async () => {
  try {
    await redis.flushdb();
    console.log("🗑️  All cache cleared");
    return true;
  } catch (error) {
    console.error("Cache flush error:", error);
    return false;
  }
};

/**
 * Fetch and cache sheet standings
 */
export const fetchAndCacheSheetStandings = async (training, sheet) => {
  try {
    console.log(`  📝 Fetching sheet: ${sheet.title}`);
    const cfSheetId = sheet.cfContestId;
    try {
      console.log(
        `Fetching sheet standings for ${training.trainees.length} trainees...`
      );
      const handles = training.trainees.map((t) => t.handle);
      const cfStandings = await fetchCFStandings(cfSheetId, handles, true);
      // Map CF standings to our format
      const standings = training.trainees.map((trainee) => {
        const cfData = cfStandings.find((s) => s.handle === trainee.handle);
        if (cfData) {
          const solvedCount = cfData.problemResults.filter(
            (pr) => pr.points > 0
          ).length;
          
          // Calculate penalty based on training type
          let penalty = cfData.penalty;
          if (training.type === "camp") {
            penalty = recalculateCampPenalty(cfData.problemResults, cfData.penalty);
          }
          
          return {
            traineeId: trainee._id,
            name: trainee.name,
            handle: trainee.handle,
            rating: trainee.rating,
            titlePhoto: trainee.titlePhoto,
            color: trainee.color,
            rank: cfData.rank,
            solvedCount,
            totalProblems: sheet.problems.length,
            points: cfData.points,
            penalty: penalty,
            problemResults: cfData.problemResults,
            coach: trainee.coach,
          };
        }
        // Trainee didn't participate
        return {
          traineeId: trainee._id,
          name: trainee.name,
          handle: trainee.handle,
          rating: trainee.rating,
          titlePhoto: trainee.titlePhoto,
          color: trainee.color,
          rank: null,
          solvedCount: 0,
          totalProblems: sheet.problems.length,
          points: 0,
          participated: false,
          penalty: 0,
          coach: trainee.coach,
        };
      });

      // Sort by penalty (ascending), then by handle (alphabetically)
      // Sort by solved problems (descending), then penalty (ascending), then handle (alphabetically)
      standings.sort((a, b) => {
        // Primary sort: solved problems (more is better)
        const solvedDiff = (b.solvedCount || 0) - (a.solvedCount || 0);
        if (solvedDiff !== 0) return solvedDiff;

        // Secondary sort: penalty (lower is better)
        const penaltyA = a.penalty ?? Infinity;
        const penaltyB = b.penalty ?? Infinity;
        const penaltyDiff = penaltyA - penaltyB;
        if (penaltyDiff !== 0) return penaltyDiff;

        // Tertiary sort: handle (alphabetically)
        return (a.handle || "").localeCompare(b.handle || "");
      });

      const cacheData = {
        sheet: {
          id: sheet._id,
          title: sheet.title,
          cfSheetId: sheet.cfContestId,
          totalProblems: sheet.problems.length,
        },
        standings,
        cachedAt: new Date().toISOString(),
      };
      const cacheKey = generateCacheKey("sheet", training._id, sheet._id);
      await setInCache(cacheKey, cacheData);
      return cacheData;
    } catch (error) {
      console.error(`Error fetching sheet standings: ${error.message}`);
      throw error;
    }
  } catch (error) {
    console.error(`Failed to cache sheet ${sheet._id}:`, error.message);
    throw error;
  }
};

/**
 * Fetch and cache contest standings
 */
export const fetchAndCacheContestStandings = async (training, contest) => {
  const cfContestId = contest.cfContestId;
  if (cfContestId) {
    try {
      console.log(
        `Fetching CF contest ${cfContestId} standings (1 API call)...`
      );

      const handles = training.trainees.map((t) => t.handle);
      const cfStandings = await fetchCFStandings(cfContestId, handles);

      // Map CF standings to our format
      const standings = training.trainees.map((trainee) => {
        const cfData = cfStandings.find((s) => s.handle === trainee.handle);

        if (cfData) {
          const solvedCount = cfData.problemResults.filter(
            (pr) => pr.points > 0
          ).length;

          // Calculate penalty based on training type
          let penalty = cfData.penalty;
          if (training.type === "camp") {
            penalty = recalculateCampPenalty(cfData.problemResults, cfData.penalty);
          }

          return {
            traineeId: trainee._id,
            name: trainee.name,
            handle: trainee.handle,
            rating: trainee.rating,
            titlePhoto: trainee.titlePhoto,
            color: trainee.color,
            rank: cfData.rank,
            solvedCount,
            totalProblems: contest.problems.length,
            points: cfData.points,
            penalty: penalty,
            problemResults: cfData.problemResults,
            coach: trainee.coach,
          };
        }

        // Trainee didn't participate
        return {
          traineeId: trainee._id,
          name: trainee.name,
          handle: trainee.handle,
          rating: trainee.rating,
          titlePhoto: trainee.titlePhoto,
          color: trainee.color,
          rank: null,
          solvedCount: 0,
          penalty: 0,
          totalProblems: contest.problems.length,
          points: 0,
          participated: false,
          coach: trainee.coach,
        };
      });

      // Sort by solved problems (descending), then penalty (ascending), then handle (alphabetically)
      standings.sort((a, b) => {
        // Primary sort: solved problems (more is better)
        const solvedDiff = (b.solvedCount || 0) - (a.solvedCount || 0);
        if (solvedDiff !== 0) return solvedDiff;

        // Secondary sort: penalty (lower is better)
        const penaltyA = a.penalty ?? Infinity;
        const penaltyB = b.penalty ?? Infinity;
        const penaltyDiff = penaltyA - penaltyB;
        if (penaltyDiff !== 0) return penaltyDiff;

        // Tertiary sort: handle (alphabetically)
        return (a.handle || "").localeCompare(b.handle || "");
      });

      const cacheData = {
        contest: {
          id: contest._id,
          title: contest.title,
          cfContestId,
          totalProblems: contest.problems.length,
        },
        standings,
        cachedAt: new Date().toISOString(),
      };

      const cacheKey = generateCacheKey("contest", training._id, contest._id);
      await setInCache(cacheKey, cacheData);

      return cacheData;
    } catch (cfError) {
      console.warn(`Failed to fetch CF standings: ${cfError.message}`);
      console.log("Falling back to individual submission checks...");
    }
  }
};

/**
 * Fetch and cache overall training standings
 */
export const fetchAndCacheOverallStandings = async (training) => {
  try {
    console.log(
      `Calculating overall standings for ${training.trainees.length} trainees...`
    );

    // Get all items (sheets + contests) with their problems
    const items = [
      ...training.sheets.map((s) => ({ ...s.toObject(), type: "Sheet" })),
      ...training.contests.map((c) => ({ ...c.toObject(), type: "Contest" })),
    ];
    const handles = training.trainees.map((t) => t.handle);

    // Map to accumulate total solved per trainee
    const traineeTotals = new Map();

    // For each item, calculate standings
    for (const item of items) {
      try {
        const cfStanding = await fetchCFStandings(
          item.cfContestId,
          handles,
          item.type === "Sheet"
        );

        // Loop over each trainee
        for (const trainee of training.trainees) {
          const cfData = cfStanding.find((s) => s.handle === trainee.handle);
          const solvedCount = cfData
            ? cfData.problemResults.filter((pr) => pr.points > 0).length
            : 0;
          // Update trainee's total solved problems
          const currentTotal = traineeTotals.get(trainee.handle) || {
            traineeId: trainee._id,
            name: trainee.name,
            handle: trainee.handle,
            rating: trainee.rating,
            color: trainee.color,
            totalSolved: 0,
            totalPoints: 0,
            titlePhoto: trainee.titlePhoto,
            coach: trainee.coach,
            penalty: 0,
            items: [], // store per-item performance
          };

          // Calculate penalty based on training type
          let itemPenalty = cfData ? cfData.penalty : 0;
          if (training.type === "camp" && cfData) {
            itemPenalty = recalculateCampPenalty(cfData.problemResults, cfData.penalty);
          }

          currentTotal.totalSolved += solvedCount;
          currentTotal.totalPoints += cfData ? cfData.points : 0;
          currentTotal.penalty += itemPenalty;

          currentTotal.items.push({
            itemId: item._id,
            title: item.title,
            type: item.type,
            solvedCount,
            totalProblems: item.problems.length,
            points: cfData ? cfData.points : 0,
            penalty: itemPenalty,
          });

          traineeTotals.set(trainee.handle, currentTotal);
        }
      } catch (error) {
        console.error(`Failed to fetch overall standings: ${error.message}`);
        throw error;
        //res.status(500).json({ success: false, error: error.message });
      }
    }
    
    const standings = Array.from(traineeTotals.values()).sort((a, b) => {
      // Primary sort: total solved problems (more is better - decreasing)
      const solvedDiff = (b.totalSolved || 0) - (a.totalSolved || 0);
      if (solvedDiff !== 0) return solvedDiff;

      // Secondary sort: penalty (less is better - increasing)
      const penaltyA = a.penalty ?? Infinity;
      const penaltyB = b.penalty ?? Infinity;
      const penaltyDiff = penaltyA - penaltyB;
      if (penaltyDiff !== 0) return penaltyDiff;

      // Tertiary sort: handle (alphabetically A to Z)
      return (a.handle || "").localeCompare(b.handle || "");
    });
    // Add rank
    standings.forEach((standing, index) => {
      standing.rank = index + 1;
    });

    const cacheData = {
      training: {
        id: training._id,
        title: training.title,
        level: training.level,
        sheetsCount: training.sheets.length,
        contestsCount: training.contests.length,
        totalProblems: items.reduce(
          (sum, item) => sum + item.problems.length,
          0
        ),
      },
      standings,
      cachedAt: new Date().toISOString(),
    };

    const cacheKey = generateCacheKey("overall", training._id);
    await setInCache(cacheKey, cacheData);

    return cacheData;
  } catch (error) {
    console.error(`Failed to fetch overall standings: ${error.message}`);
    throw error;
  }
};

/**
 * Update all cache (runs at midnight)
 */
export const updateAllCache = async () => {
  const startTime = Date.now();
  console.log("\n🔄 Starting cache update at", new Date().toLocaleString());

  try {
    const trainings = await Training.find()
      .populate("trainees")
      .populate("sheets")
      .populate("contests");

    console.log(`📚 Found ${trainings.length} trainings to cache`);

    for (const training of trainings) {
      console.log(`\n📖 Processing: ${training.title}`);

      // Cache sheets
      for (const sheet of training.sheets) {
        await fetchAndCacheSheetStandings(training, sheet);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Cache contests
      for (const contest of training.contests) {
        await fetchAndCacheContestStandings(training, contest);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Cache overall standings
      await fetchAndCacheOverallStandings(training);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Cache update completed in ${duration}s`);
  } catch (error) {
    console.error("\n❌ Cache update failed:", error.message);
  }
};

/**
 * Initialize cron job for automatic cache updates at midnight
 */
export const initializeCacheScheduler = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      console.log("\n⏰ Scheduled cache update triggered at midnight");
      await updateAllCache();
    },
    {
      timezone: process.env.TIMEZONE || "Africa/Cairo",
    }
  );

  console.log("✅ Cache scheduler initialized (runs daily at 12:00 AM)");
};

/**
 * Get cache statistics
 */
export const getCacheStats = async () => {
  try {
    const info = await redis.info("stats");
    const dbsize = await redis.dbsize();
    const keys = await redis.keys("standings:*");

    return {
      totalKeys: dbsize,
      standingsKeys: keys.length,
      memoryUsed: info.match(/used_memory_human:(.+)/)?.[1]?.trim(),
      connected: redis.status === "ready",
    };
  } catch (error) {
    console.error("Error getting cache stats:", error);
    return null;
  }
};

/**
 * Helper: Get with auto-fetch
 * Checks cache first, if not found, fetches and caches
 */
export const getOrFetch = async (key, fetchFunction) => {
  // Try to get from cache
  const cached = await getFromCache(key);
  if (cached) {
    return { data: cached, fromCache: true };
  }

  // Not in cache, fetch fresh data
  const freshData = await fetchFunction();

  // Cache the fresh data
  await setInCache(key, freshData);

  return { data: freshData, fromCache: false };
};

export default redis;
