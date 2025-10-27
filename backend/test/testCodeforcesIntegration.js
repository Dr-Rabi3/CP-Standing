import dotenv from "dotenv";
import {
  getUserInfo,
  getUserSubmissions,
  checkSolvedProblems,
  getContestStandings,
  getContestInfo,
} from "../services/codeforcesService.js";

dotenv.config();

const testIntegration = async () => {
  console.log("🚀 Testing Codeforces API Integration...\n");
  
  // Test 1: Get user info (Public API - no auth)
  console.log("📝 Test 1: Getting user info for 'tourist'...");
  try {
    const userInfo = await getUserInfo("tourist");
    console.log("✅ Success:", userInfo);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
  console.log("\n");
  
  // Test 2: Get user submissions (Sheet API - authenticated)
  console.log("📝 Test 2: Getting submissions for 'tourist'...");
  try {
    const submissions = await getUserSubmissions("tourist", 5);
    console.log(`✅ Success: Retrieved ${submissions.length} submissions`);
    console.log("First submission:", {
      problem: `${submissions[0].problem.contestId}${submissions[0].problem.index}`,
      verdict: submissions[0].verdict,
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
  console.log("\n");
  
  // Test 3: Check solved problems (Sheet API - authenticated)
  console.log("📝 Test 3: Checking solved problems for 'tourist'...");
  try {
    const problems = [
      { name: "1A", alpha: "A" },
      { name: "1B", alpha: "B" },
      { name: "2000A", alpha: "A" },
    ];
    const results = await checkSolvedProblems("tourist", problems);
    console.log("✅ Success:");
    results.forEach(r => {
      console.log(`  - ${r.name}: ${r.solved ? "✓ Solved" : "✗ Not solved"}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
  console.log("\n");
  
  // Test 4: Get contest info (Contest API - authenticated)
  console.log("📝 Test 4: Getting contest info for contest 1...");
  try {
    const contestInfo = await getContestInfo(1);
    console.log("✅ Success:");
    console.log(`  Contest: ${contestInfo.contest.name}`);
    console.log(`  Problems: ${contestInfo.problems.length}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
  console.log("\n");
  
  // Test 5: Get contest standings (Contest API - authenticated)
  console.log("📝 Test 5: Getting contest standings for contest 1...");
  try {
    const handles = ["tourist", "Petr"];
    const standings = await getContestStandings(1, handles);
    console.log("✅ Success:");
    standings.forEach(s => {
      console.log(`  - ${s.handle}: Rank ${s.rank}, Points: ${s.points}`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
  console.log("\n");
  
  console.log("✨ All tests completed!");
};

// Run tests
testIntegration().catch(console.error);