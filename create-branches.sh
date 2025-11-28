#!/bin/bash

# Script to create separate branches for each project folder
# Run this script from the root of the repository

# Exit on error
set -e

# Verify we are in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Error: Not inside a git repository"
    exit 1
fi

# Verify the repository is in a clean state
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "Error: Repository has uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Verify required folders exist
for folder in "Scripts-Base" "TP-Ansible" "TP-Vagrant"; do
    if [ ! -d "$folder" ]; then
        echo "Error: Required folder '$folder' does not exist"
        exit 1
    fi
done

# Get the current branch name to return to it later
CURRENT_BRANCH=$(git branch --show-current)

echo "Creating branches for each project folder..."

# Function to create a branch with specific folder content
create_branch_for_folder() {
    local folder_name=$1
    local branch_name=$2
    
    echo "----------------------------------------"
    echo "Creating branch '$branch_name' for folder '$folder_name'"
    
    # Create orphan branch (no commit history)
    git checkout --orphan "$branch_name"
    
    # Remove all files from staging (only if there are files)
    if git ls-files --cached | grep -q .; then
        git rm -rf .
    fi
    
    # Copy only the specific folder content
    git checkout "$CURRENT_BRANCH" -- "$folder_name"
    
    # Also include README if exists
    if git show "$CURRENT_BRANCH:README.md" > /dev/null 2>&1; then
        git checkout "$CURRENT_BRANCH" -- README.md
    else
        echo "Note: README.md not found in $CURRENT_BRANCH, skipping..."
    fi
    
    # Commit the changes
    git add .
    git commit -m "Initial commit for $branch_name branch with $folder_name content"
    
    echo "Branch '$branch_name' created successfully!"
}

# Create branch for Scripts-Base
create_branch_for_folder "Scripts-Base" "Scripts-Base"

# Create branch for TP-Ansible
create_branch_for_folder "TP-Ansible" "TP-Ansible"

# Create branch for TP-Vagrant
create_branch_for_folder "TP-Vagrant" "TP-Vagrant"

# Return to original branch
echo "----------------------------------------"
echo "Returning to original branch: $CURRENT_BRANCH"
git checkout "$CURRENT_BRANCH"

echo "----------------------------------------"
echo "All branches created successfully!"
echo ""
echo "To push the new branches to remote, run:"
echo "  git push origin Scripts-Base"
echo "  git push origin TP-Ansible"
echo "  git push origin TP-Vagrant"
echo ""
echo "To list all branches:"
echo "  git branch -a"
