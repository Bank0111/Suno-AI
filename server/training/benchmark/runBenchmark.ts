import { executeBenchmarkSuite, formatFullBenchmarkReport } from './abRunner';

function main() {
  console.log("==================================================");
  console.log("PHASE 3.5: BENCHMARK INTEGRITY & REAL OUTPUT EVALUATION");
  console.log("Intelligent AI Song Writer - Multi-Run 24-Output Suite");
  console.log("==================================================\n");

  const report = executeBenchmarkSuite();
  const markdown = formatFullBenchmarkReport(report);

  console.log(markdown);
  console.log("\n==================================================");
  console.log("BENCHMARK EXECUTION COMPLETE");
  console.log("==================================================");
}

main();
