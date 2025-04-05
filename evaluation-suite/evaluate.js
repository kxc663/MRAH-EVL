// FILE: evaluation-suite/evaluate.js
// PURPOSE: Runs Lighthouse programmatically to evaluate web performance
//          of the Baseline vs MRAH Next.js applications.
//
// IMPORTANT INSTRUCTIONS FOR ACCURATE TESTING:
// 
// 1. Make sure BOTH applications are running before you start the test:
//    - Baseline app should be running on http://localhost:3000
//    - MRAH app should be running on http://localhost:3001
//
// 2. If your apps use different ports, update the URLs in the scenarios below
//
// 3. If you're testing a specific route (like a product page), update the 
//    PRODUCT_ID constant below with a valid product ID for your application
//
// 4. Run with: node evaluate.js
//
// 5. Results will be saved in the ./results directory

// Using ES Module syntax (ensure your package.json has "type": "module" or use .mjs extension)

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url'; // To get __dirname equivalent in ES modules
import { chromium } from 'playwright'; // To launch and control Chrome
import lighthouse from 'lighthouse';   // The Lighthouse library
import { throttling } from 'lighthouse/core/config/constants.js'; // Import throttling constants
// If using CommonJS (remove "type": "module" from package.json):
// const fs = require('fs').promises;
// const path = require('path');
// const { chromium } = require('playwright');
// const lighthouse = require('lighthouse');
// const { throttling } = require('lighthouse/core/config/constants');

/*
    FCP: First Contentful Paint
    LCP: Largest Contentful Paint
    CLS: Cumulative Layout Shift
    TBT: Total Blocking Time
    TTI: Time To Interactive
    ScriptBytes: Total JS payload size
*/

// --- Configuration ---
const NUM_RUNS = 5; // Number of Lighthouse runs per scenario for median calculation
const PRODUCT_ID = '123'; // Example product ID to test

// Get directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RESULTS_DIR = path.join(__dirname, 'results');

const scenarios = [
    // --- Baseline App Scenarios ---
    {
        name: `Baseline - Desktop Fast Network`,
        url: `http://localhost:3000/products/${PRODUCT_ID}`, // <<< CHANGE PORT/URL IF NEEDED
        config: { // Lighthouse config preset
            extends: 'lighthouse:default', // Use standard Lighthouse checks
            settings: {
                formFactor: 'desktop',
                screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1 },
                throttlingMethod: 'provided', // Don't apply Lighthouse throttling here
                onlyCategories: ['performance'], // Only run performance audits
                maxWaitForFcp: 30000, // Wait up to 30 seconds for First Contentful Paint
                maxWaitForLoad: 60000, // Wait up to 60 seconds for full page load
                skipAudits: [], // Run all audits in the performance category
            },
        },
        launchOptions: {} // No specific Playwright throttling for this one
    },
    {
        name: `Baseline - Mobile Slow 3G`,
        url: `http://localhost:3000/products/${PRODUCT_ID}`, // <<< CHANGE PORT/URL IF NEEDED
        config: {
            extends: 'lighthouse:default',
            settings: {
                formFactor: 'mobile',
                screenEmulation: { mobile: true, width: 360, height: 640, deviceScaleFactor: 2 },
                throttlingMethod: 'simulate', // Lighthouse handles throttling
                throttling: throttling.mobileSlowRegular, // Use standard LH slow-4g preset (adjust if needed)
                onlyCategories: ['performance'],
                maxWaitForFcp: 45000, // Wait up to 45 seconds for FCP on mobile slow 3G
                maxWaitForLoad: 90000, // Wait up to 90 seconds for full page load on mobile slow 3G
                skipAudits: [], // Run all audits in the performance category
            },
        },
        launchOptions: {} // Throttling handled by Lighthouse 'simulate'
    },

    // --- MRAH App Scenarios ---
    {
        name: `MRAH - Desktop Fast Network`,
        url: `http://localhost:3001/products/${PRODUCT_ID}`, // <<< CHANGE PORT/URL IF NEEDED
        config: { // Identical config to Baseline Desktop Fast
            extends: 'lighthouse:default',
            settings: {
                formFactor: 'desktop',
                screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1 },
                throttlingMethod: 'provided',
                onlyCategories: ['performance'],
                maxWaitForFcp: 30000, // Wait up to 30 seconds for First Contentful Paint
                maxWaitForLoad: 60000, // Wait up to 60 seconds for full page load
                skipAudits: [], // Run all audits in the performance category
            },
        },
        launchOptions: {}
    },
    {
        name: `MRAH - Mobile Slow 3G`,
        url: `http://localhost:3001/products/${PRODUCT_ID}`, // <<< CHANGE PORT/URL IF NEEDED
         config: { // Identical config to Baseline Mobile Slow 3G
            extends: 'lighthouse:default',
            settings: {
                formFactor: 'mobile',
                screenEmulation: { mobile: true, width: 360, height: 640, deviceScaleFactor: 2 },
                throttlingMethod: 'simulate',
                throttling: throttling.mobileSlowRegular, // Use same preset as baseline
                onlyCategories: ['performance'],
                maxWaitForFcp: 45000, // Wait up to 45 seconds for FCP on mobile slow 3G
                maxWaitForLoad: 90000, // Wait up to 90 seconds for full page load on mobile slow 3G
                skipAudits: [], // Run all audits in the performance category
            },
        },
        launchOptions: {}
    },
    // --- Add more scenarios as needed (e.g., different network speeds, CPU throttling combinations) ---
];

// --- Helper Functions ---

/** Calculates the median value from an array of numbers. */
function median(values) {
    if (!Array.isArray(values) || values.length === 0) return 0;
    const sortedValues = [...values].sort((a, b) => a - b); // Sort numerically
    const half = Math.floor(sortedValues.length / 2);
    if (sortedValues.length % 2) { // Odd number of values
        return sortedValues[half];
    } else { // Even number of values
        return (sortedValues[half - 1] + sortedValues[half]) / 2.0;
    }
}

/** Extracts key performance metrics from the Lighthouse result object (LHR). */
function extractMetrics(lhr) {
    const audits = lhr?.audits;
    if (!audits) {
        console.warn("Lighthouse audits object not found in result.");
        return { FCP: 0, LCP: 0, CLS: 0, TBT: 0, TTI: 0, ScriptBytes: 0 };
    }

    // Helper to safely get numeric value or 0
    const getNumericValue = (auditId) => audits[auditId]?.numericValue ?? 0;

    // Get script bytes - look for JS transferred in network requests
    let scriptBytes = 0;
    const scriptRequests = audits['network-requests']?.details?.items || [];
    
    // Sum up all JavaScript resource sizes
    scriptBytes = scriptRequests
        .filter(req => req.resourceType === 'Script')
        .reduce((total, req) => total + (req.transferSize || 0), 0);
    
    // If no script bytes found in network requests, try the total byte weight audit
    if (scriptBytes === 0) {
        const totalByteWeightItems = audits['total-byte-weight']?.details?.items || [];
        const scriptItem = totalByteWeightItems.find(item => 
            item.resourceType === 'script' || item.resourceType === 'Script'
        );
        scriptBytes = scriptItem?.totalBytes || 0;
    }

    return {
        FCP: getNumericValue('first-contentful-paint'),
        LCP: getNumericValue('largest-contentful-paint'),
        CLS: getNumericValue('cumulative-layout-shift'),
        TBT: getNumericValue('total-blocking-time'),
        TTI: getNumericValue('interactive'), // Time To Interactive
        ScriptBytes: scriptBytes, // Total JS payload size
    };
}

// --- Main Evaluation Logic ---
async function runEvaluation() {
    const aggregatedResults = {};
    let browser = null; // Keep browser instance

    console.log("Starting Lighthouse evaluation...");

    try {
        // Ensure results directory exists
        await fs.mkdir(RESULTS_DIR, { recursive: true });
        console.log(`Results will be saved in: ${RESULTS_DIR}`);

        // Use a fixed debugging port for simplicity
        const port = 9222;
        
        // Launch Chrome with specific remote debugging port
        browser = await chromium.launch({
            headless: true,
            args: [`--remote-debugging-port=${port}`] // Explicitly set the debugging port
        });
        
        console.log(`Chrome launched via Playwright with debugging port: ${port}`);

        // Warmup both applications to ensure they're running
        await warmupApplications(browser);
        
        for (const scenario of scenarios) {
            console.log(`\n--- Running Scenario: ${scenario.name} ---`);
            const runMetricsCollector = { FCP: [], LCP: [], CLS: [], TBT: [], TTI: [], ScriptBytes: [] };

            for (let i = 0; i < NUM_RUNS; i++) {
                console.log(`  Run ${i + 1}/${NUM_RUNS} for ${scenario.name}...`);
                let lhr; // Lighthouse result object
                try {
                    // Connect Lighthouse to the running browser instance via port
                    const runnerResult = await lighthouse(scenario.url, {
                        port: port,
                        output: 'json',        // Get JSON output
                        logLevel: 'silent', // Change to 'info' or 'verbose' for debugging
                        ...scenario.config.settings // Pass Lighthouse settings directly
                    }, scenario.config); // Pass the full config which might include 'extends'

                    if (!runnerResult) {
                         throw new Error("Lighthouse runnerResult is undefined.");
                    }
                    lhr = runnerResult.lhr; // The Lighthouse result object

                    const metrics = extractMetrics(lhr);

                    // Store metrics for this specific run
                    Object.keys(runMetricsCollector).forEach(key => {
                        if (typeof metrics[key] === 'number') { // Ensure we only push numbers
                             runMetricsCollector[key].push(metrics[key]);
                        } else {
                            console.warn(`  Metric ${key} was not a number in run ${i+1}:`, metrics[key]);
                        }
                    });
                    console.log(`    Run ${i + 1} Metrics: FCP=${metrics.FCP.toFixed(0)} TBT=${metrics.TBT.toFixed(0)} TTI=${metrics.TTI.toFixed(0)} LCP=${metrics.LCP.toFixed(0)} CLS=${metrics.CLS.toFixed(3)} JS=${(metrics.ScriptBytes/1024).toFixed(1)}kB`);

                    // Optional: Save individual LHR JSON reports for deeper analysis
                    // const reportFilename = `${scenario.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_run_${i + 1}.json`;
                    // await fs.writeFile(path.join(RESULTS_DIR, reportFilename), JSON.stringify(lhr, null, 2));

                } catch (error) {
                    console.error(`  ERROR during Lighthouse run ${i + 1} for ${scenario.name}:`, error.message);
                    // Optional: Decide if you want to stop the whole process or just skip this run
                    // throw error; // Uncomment to stop evaluation on first error
                }
                 // Small delay between runs can sometimes help stability
                 await new Promise(resolve => setTimeout(resolve, 500));
            } // End of runs loop

            // Calculate median results for the current scenario
            const medianResults = {};
            Object.keys(runMetricsCollector).forEach(key => {
                medianResults[key] = median(runMetricsCollector[key]);
            });

            aggregatedResults[scenario.name] = medianResults; // Store median results
            console.log(`  Median Results for ${scenario.name}:`, medianResults);

        } // End of scenarios loop

    } catch (error) {
        console.error("\n--- EVALUATION FAILED ---");
        console.error(error);
    } finally {
        if (browser) {
            await browser.close();
            console.log("\nBrowser closed.");
        }
    }

    // --- Output Final Aggregated Results ---
    console.log("\n--- Final Median Results Summary ---");
    console.table(aggregatedResults);

    // Save aggregated results to a summary file
    try {
        const summaryPath = path.join(RESULTS_DIR, 'summary_results.json');
        await fs.writeFile(summaryPath, JSON.stringify(aggregatedResults, null, 2));
        console.log(`\nSummary results saved to: ${summaryPath}`);
    } catch (writeError) {
        console.error("\nFailed to write summary results file:", writeError);
    }

    console.log("\nEvaluation complete.");
}

/**
 * Warmup the applications to ensure they're running before testing
 */
async function warmupApplications(browser) {
    console.log("Warming up applications...");
    
    // Create a new context and page
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Try to access both applications
    try {
        console.log("Checking if baseline app is running...");
        await page.goto(`http://localhost:3000/`, { timeout: 30000, waitUntil: 'networkidle' });
        console.log("✓ Baseline app is running");
    } catch (error) {
        console.warn("⚠️ Could not connect to baseline app. Is it running on port 3000?");
        console.warn("  Error:", error.message);
    }
    
    try {
        console.log("Checking if MRAH app is running...");
        await page.goto(`http://localhost:3001/`, { timeout: 30000, waitUntil: 'networkidle' });
        console.log("✓ MRAH app is running");
    } catch (error) {
        console.warn("⚠️ Could not connect to MRAH app. Is it running on port 3001?");
        console.warn("  Error:", error.message);
    }
    
    // Close the context when done
    await context.close();
    console.log("Warmup complete");
}

// --- Run the Evaluation ---
runEvaluation();