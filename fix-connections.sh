#!/bin/bash

# Fix all API routes to use pool.execute() instead of connection.end()

# List of files to fix
files=(
  "src/app/api/players/[id]/route.ts"
  "src/app/api/players/[id]/stats/route.ts"
  "src/app/api/players/[id]/performances/route.ts"
  "src/app/api/teams/[id]/players/route.ts"
  "src/app/api/teams/[id]/stats/route.ts"
  "src/app/api/stadiums/route.ts"
  "src/app/api/stadiums/[id]/route.ts"
  "src/app/api/points-table/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Replace connection.end() with connection.release()
    sed -i.bak 's/await connection\.end()/await connection.release()/g' "$file"
    # Remove .bak files
    rm -f "$file.bak"
    echo "Fixed $file"
  else
    echo "File $file not found"
  fi
done

echo "All files processed!"
