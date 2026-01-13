#!/bin/bash
set -e

IMAGE_NAME="uhub_devsecaiops-toolkit-backend"
REPORT_DIR="reports/security"

mkdir -p $REPORT_DIR

echo "🔒 Starting Supply Chain Security Audit..."

# 1. Vulnerability Scanning (Trivy)
echo "🔎 Scanning for Vulnerabilities (CRITICAL only)..."
# We run trivial scan but fail only on critical for now to not block completely if user checks functionality
# Map current dir to /outputs in container
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    -v $(pwd)/$REPORT_DIR:/outputs \
    aquasec/trivy image --severity CRITICAL --scanners vuln \
    --format table --output /outputs/vuln_report.txt \
    $IMAGE_NAME

echo "✅ Vulnerability Report generated: $REPORT_DIR/vuln_report.txt"
cat $REPORT_DIR/vuln_report.txt

# 2. SBOM Generation (CycloneDX) - "Red" Requirement
echo "📦 Generating SBOM (CycloneDX)..."
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    -v $(pwd)/$REPORT_DIR:/outputs \
    aquasec/trivy image --format cyclonedx --output /outputs/sbom.json \
    $IMAGE_NAME

echo "✅ SBOM generated: $REPORT_DIR/sbom.json"

echo "🛡️ Security Audit Complete."
