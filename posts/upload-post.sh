#!/bin/bash

# Script to upload a markdown blog post to the API
# Usage: ./upload-post.sh <post-file.md>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <post-file.md>"
  echo "Example: $0 hello-world.md"
  exit 1
fi

POST_FILE="$1"

if [ ! -f "$POST_FILE" ]; then
  echo "Error: File '$POST_FILE' not found"
  exit 1
fi

# Configuration
API_URL="https://api.stevewanglog.com/posts/internal/posts"
ADMIN_API_KEY="${ADMIN_API_KEY:-238bf34a75dc10cbf8526aed35862046d6883ba820c132bafbb5a524a800a647}"

echo "Uploading post: $POST_FILE"
echo "API URL: $API_URL"
echo ""

# Extract frontmatter and content
CONTENT=$(cat "$POST_FILE")

# Use Python to parse the frontmatter and create JSON
PAYLOAD=$(python3 <<EOF
import sys
import json
import re

content = """$CONTENT"""

# Extract frontmatter
match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
if not match:
    print("Error: No frontmatter found in markdown file", file=sys.stderr)
    sys.exit(1)

frontmatter_text = match.group(1)
body = match.group(2).strip()

# Parse frontmatter
frontmatter = {}
for line in frontmatter_text.split('\n'):
    if ':' in line:
        key, value = line.split(':', 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")

        if key == 'tags':
            # Tags are on next lines
            continue
        elif line.startswith('  -'):
            # This is a tag item
            tag = line.strip().lstrip('-').strip()
            if 'tags' not in frontmatter:
                frontmatter['tags'] = []
            frontmatter['tags'].append(tag)
        else:
            frontmatter[key] = value

# Create JSON payload
payload = {
    "title": frontmatter.get('title', ''),
    "slug": frontmatter.get('slug', ''),
    "content": body,
    "summary": frontmatter.get('summary', ''),
    "tags": frontmatter.get('tags', []),
    "published": True
}

print(json.dumps(payload))
EOF
)

if [ $? -ne 0 ]; then
  echo "Error parsing markdown file"
  exit 1
fi

echo "Parsed content:"
echo "$PAYLOAD" | python3 -m json.tool
echo ""

# Upload to API
echo "Uploading to API..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "Response (HTTP $HTTP_CODE):"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
  echo ""
  echo "✅ Post uploaded successfully!"
else
  echo ""
  echo "❌ Upload failed with status $HTTP_CODE"
  exit 1
fi
