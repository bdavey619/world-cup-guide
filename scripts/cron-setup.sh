#!/usr/bin/env bash
# cron-setup.sh — Install cron jobs to auto-update confirmed XIs before each match
#
# Run once: bash scripts/cron-setup.sh
#
# This adds crontab entries that run `update-lineup.js` 90 minutes before
# each Group Stage kickoff, so you have the confirmed XI ready when you open
# the guide on matchday.
#
# The script only PRINTS the suggested lineup and instructions — you still
# run the Claude Code session to apply changes. See README for full workflow.

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "World Cup 2026 — Lineup cron setup"
echo "Repo: $REPO_DIR"
echo ""
echo "Add these lines to your crontab (run: crontab -e):"
echo ""
echo "# ─── Group A ───────────────────────────────────────────────"
echo "# Jun 11 3PM ET kickoff → run at 1:30PM ET (90 min before)"
echo "30 13 11 6 * cd $REPO_DIR && node scripts/update-lineup.js mexico >> /tmp/wc-lineup.log 2>&1"
echo "30 13 11 6 * cd $REPO_DIR && node scripts/update-lineup.js south-africa >> /tmp/wc-lineup.log 2>&1"
echo "# Jun 11 10PM ET"
echo "30 20 11 6 * cd $REPO_DIR && node scripts/update-lineup.js south-korea >> /tmp/wc-lineup.log 2>&1"
echo "30 20 11 6 * cd $REPO_DIR && node scripts/update-lineup.js czechia >> /tmp/wc-lineup.log 2>&1"
echo ""
echo "# ─── Group B ───────────────────────────────────────────────"
echo "30 13 12 6 * cd $REPO_DIR && node scripts/update-lineup.js canada >> /tmp/wc-lineup.log 2>&1"
echo "30 13 12 6 * cd $REPO_DIR && node scripts/update-lineup.js bosnia-herzegovina >> /tmp/wc-lineup.log 2>&1"
echo ""
echo "# ... (add remaining groups similarly)"
echo ""
echo "After cron runs, check /tmp/wc-lineup.log for the suggested changes,"
echo "then apply with Claude Code."
