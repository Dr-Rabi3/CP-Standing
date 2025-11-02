import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const CF_API_BASE = "https://codeforces.com/api";

// API Keys Configuration
const CONTEST_API_KEY = process.env.CF_CONTEST_API_KEY;
const CONTEST_API_SECRET = process.env.CF_CONTEST_API_SECRET;
const SHEET_API_KEY = process.env.CF_SHEET_API_KEY;
const SHEET_API_SECRET = process.env.CF_SHEET_API_SECRET;


/**
 * Generate API signature for authenticated requests
 * @param {string} method - API method name
 * @param {object} params - Request parameters
 * @param {string} apiKey - API key to use
 * @param {string} apiSecret - API secret to use
 * @returns {object} - Parameters with apiKey and apiSig
 */
const generateApiSig = (method, params, apiKey, apiSecret) => {
  // Generate random string (6 characters)
  const rand = Math.random().toString(36).substring(2, 8);
  
  // Add apiKey and time to params
  const allParams = {
    ...params,
    apiKey,
    time: Math.floor(Date.now() / 1000),
  };
  
  // Sort parameters alphabetically
  const sortedKeys = Object.keys(allParams).sort();
  
  // Build query string
  const paramString = sortedKeys
    .map(key => `${key}=${allParams[key]}`)
    .join("&");
  
  // Create signature string: rand/method?params#secret
  const sigString = `${rand}/${method}?${paramString}#${apiSecret}`;
  
  // Generate SHA-512 hash
  const hash = crypto.createHash("sha512").update(sigString).digest("hex");
  
  // Combine rand and hash
  const apiSig = `${rand}${hash}`;
  
  return {
    ...allParams,
    apiSig,
  };
};

/**
 * Make authenticated API request
 * @param {string} method - API method name
 * @param {object} params - Request parameters
 * @param {string} apiKey - API key to use
 * @param {string} apiSecret - API secret to use
 * @returns {Promise} - API response
 */
const makeAuthenticatedRequest = async (method, params, apiKey, apiSecret) => {
  const signedParams = generateApiSig(method, params, apiKey, apiSecret);
  
  try {
    const response = await axios.get(`${CF_API_BASE}/${method}`, {
      params: signedParams,
    });
    
    if (response.data.status === "OK") {
      return response.data.result;
    }
    
    throw new Error(response.data.comment || "API request failed");
  } catch (error) {
    if (error.response?.data?.comment) {
      throw new Error(`Codeforces API: ${error.response.data.comment}`);
    }
    throw new Error(`Codeforces API error: ${error.message}`);
  }
};

// Get user info from Codeforces (public API - no auth needed)
export const getUserInfo = async (handle) => {
  try {
    const response = await axios.get(`${CF_API_BASE}/user.info`, {
      params: { handles: handle }
    });
    
    if (response.data.status === "OK") {
      const user = response.data.result[0];
      return {
        handle: user.handle,
        rating: user.rating || 0,
        rank: user.rank || "unrated",
        maxRating: user.maxRating || 0,
        maxRank: user.maxRank || "unrated",
      };
    }
    throw new Error("Failed to fetch user info");
  } catch (error) {
    throw new Error(`Codeforces API error: ${error.message}`);
  }
};

// Get multiple users info from Codeforces (public API - no auth needed)
// Can fetch up to 10,000 handles in one request
export const getMultipleUsersInfo = async (handles) => {
  try {
    if (!handles || handles.length === 0) {
      throw new Error("Handles array is empty");
    }
    
    // Codeforces API accepts semicolon-separated handles
    const handlesString = handles.join(";");
    
    const response = await axios.get(`${CF_API_BASE}/user.info`, {
      params: { handles: handlesString }
    });
    
    if (response.data.status === "OK") {
      return response.data.result.map(user => ({
        handle: user.handle,
        rating: user.rating || 0,
        rank: user.rank || "unrated",
        maxRating: user.maxRating || 0,
        maxRank: user.maxRank || "unrated",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        country: user.country || "",
        city: user.city || "",
        organization: user.organization || "",
        contribution: user.contribution || 0,
        friendOfCount: user.friendOfCount || 0,
        avatar: user.avatar || "",
        titlePhoto: user.titlePhoto || "",
      }));
    }
    throw new Error("Failed to fetch users info");
  } catch (error) {
    if (error.response?.data?.comment) {
      throw new Error(`Codeforces API: ${error.response.data.comment}`);
    }
    throw new Error(`Codeforces API error: ${error.message}`);
  }
};


// Get user submissions (uses SHEET API keys)
export const getUserSubmissions = async (handle, count = 100) => {
  try {
    const result = await makeAuthenticatedRequest(
      "user.status",
      { handle, from: 1, count },
      SHEET_API_KEY,
      SHEET_API_SECRET
    );
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }
};

// Check which problems from a list have been solved by user (uses SHEET API keys)
export const checkSolvedProblems = async (handle, problems) => {
  try {
    const submissions = await getUserSubmissions(handle, 1000);
    const solvedProblems = new Set();
    
    submissions.forEach(sub => {
      if (sub.verdict === "OK") {
        const problemKey = `${sub.problem.contestId}${sub.problem.index}`;
        solvedProblems.add(problemKey);
      }
    });
    
    const results = problems.map(problem => {
      // Extract contest ID and problem index from problem name
      // Expected format: "1234A" or similar
      const match = problem.name.match(/(\d+)([A-Z]\d*)/);
      if (match) {
        const contestId = match[1];
        const index = match[2];
        const problemKey = `${contestId}${index}`;
        
        return {
          name: problem.name,
          alpha: problem.alpha,
          solved: solvedProblems.has(problemKey),
          contestId,
          index
        };
      }
      return {
        name: problem.name,
        alpha: problem.alpha,
        solved: false
      };
    });
    
    return results;
  } catch (error) {
    throw new Error(`Error checking solved problems: ${error.message}`);
  }
};

// Get contest standings (uses CONTEST API keys)
export const getContestStandings = async (contestId, handles, asSheet = false) => {
  try {
    const result = await makeAuthenticatedRequest(
      "contest.standings",
      { 
        contestId,
        handles: handles.join(";"),
        showUnofficial: true
      },
      asSheet ? SHEET_API_KEY : CONTEST_API_KEY,
      asSheet ? SHEET_API_SECRET : CONTEST_API_SECRET
    );
    
    const standings = result.rows;
    return standings.map(row => ({
      handle: row.party.members[0].handle,
      rank: row.rank,
      points: row.points,
      penalty: row.penalty,
      problemResults: row.problemResults.map(pr => ({
        points: pr.points,
        rejectedAttemptCount: pr.rejectedAttemptCount,
        type: pr.type,
        bestSubmissionTimeSeconds: pr.bestSubmissionTimeSeconds
      }))
    }));
  } catch (error) {
    throw new Error(`Failed to fetch contest standings: ${error.message}`);
  }
};

// Get contest information (uses CONTEST API keys)
export const getContestInfo = async (contestId, asSheets = false) => {
  try {
    const result = await makeAuthenticatedRequest(
      "contest.standings",
      { contestId, from: 1, count: 1 },
      asSheets ? SHEET_API_KEY : CONTEST_API_KEY,
      asSheets ? SHEET_API_SECRET : CONTEST_API_SECRET
    );
    
    return {
      contest: result.contest,
      problems: result.problems,
    };
  } catch (error) {
    throw new Error(`Failed to fetch contest info: ${error.message}`);
  }
};

// Get multiple contests information in bulk
export const getMultipleContestsInfo = async (contestIds, asSheets = false) => {
  try {
    if (!contestIds || contestIds.length === 0) {
      throw new Error("Contest IDs array is empty");
    }
    
    // Fetch all contests in parallel
    const contestsPromises = contestIds.map(contestId => 
      getContestInfo(contestId, asSheets).catch(error => ({
        contestId,
        error: error.message,
        success: false
      }))
    );
    
    const results = await Promise.all(contestsPromises);
    
    return results.map((result, index) => {
      if (result.success === false) {
        return {
          contestId: contestIds[index],
          error: result.error,
          success: false
        };
      }
      
      return {
        contestId: contestIds[index],
        name: result.contest.name,
        type: result.contest.type,
        phase: result.contest.phase,
        durationSeconds: result.contest.durationSeconds,
        startTimeSeconds: result.contest.startTimeSeconds,
        problems: result.problems.map(p => ({
          contestId: p.contestId,
          index: p.index,
          name: p.name,
          type: p.type,
          rating: p.rating,
          tags: p.tags,
        })),
        success: true
      };
    });
  } catch (error) {
    throw new Error(`Failed to fetch contests info: ${error.message}`);
  }
};

// Calculate points based on problems solved
export const calculatePoints = (solvedCount, totalCount) => {
  const percentage = (solvedCount / totalCount) * 100;
  
  if (percentage === 100) return 100;
  if (percentage >= 90) return 90;
  if (percentage >= 80) return 80;
  if (percentage >= 70) return 70;
  if (percentage >= 60) return 60;
  if (percentage >= 50) return 50;
  if (percentage >= 40) return 40;
  if (percentage >= 30) return 30;
  if (percentage >= 20) return 20;
  if (percentage >= 10) return 10;
  return 0;
};

// Get color based on rating
export const getRatingColor = (rating) => {
  if (rating >= 3000) return "red";
  if (rating >= 2400) return "orange";
  if (rating >= 2100) return "violet";
  if (rating >= 1900) return "blue";
  if (rating >= 1600) return "cyan";
  if (rating >= 1400) return "green";
  if (rating >= 1200) return "gray";
  return "black";
};
