# IPL Database Sample Data

This directory contains organized sample data for the IPL Database Management System. Each table has its own SQL file with realistic sample data that follows the database schema constraints.

## File Structure

### Schema

-  `00_schema.sql` - Complete database schema with tables, constraints, and views

### Core Data Files

-  `01_teams.sql` - IPL teams (10 teams including GT and LSG)
-  `02_stadiums.sql` - Cricket stadiums across India and some international venues
-  `03_series.sql` - IPL seasons/tournaments from 2021-2025
-  `04_umpires.sql` - Cricket umpires (Indian and international)
-  `05_players.sql` - IPL players across all teams with realistic details
-  `06_matches.sql` - Sample matches from IPL 2024 including playoffs
-  `07_batting_scorecards.sql` - Batting performances for completed matches
-  `08_bowling_scorecards.sql` - Bowling performances for completed matches
-  `09_team_stats.sql` - Team statistics for different IPL seasons
-  `10_player_stats.sql` - Player statistics for different IPL seasons
-  `11_users.sql` - Authentication users with different roles

### Loading Scripts

-  `load_all_data.sql` - Loads all sample data in correct order
-  `load_selective_data.sql` - Template for loading specific data sets

## Data Dependencies

The data files must be loaded in the following order to maintain referential integrity:

1. **Teams** → Required by: Players, Matches, Team Stats
2. **Stadiums** → Required by: Matches
3. **Series** → Required by: Matches, Team Stats, Player Stats
4. **Umpires** → Required by: Matches
5. **Players** → Required by: Matches, Scorecards, Player Stats
6. **Matches** → Required by: Scorecards
7. **Batting/Bowling Scorecards** → Independent after matches
8. **Team/Player Stats** → Independent after teams/players/series
9. **Users** → Independent

## Usage

### Load All Data

```sql
-- From MySQL command line in the data directory:
mysql -u username -p ipl_database < load_all_data.sql
```

### Load Specific Tables

```sql
-- Load only basic setup data:
mysql -u username -p ipl_database < 01_teams.sql
mysql -u username -p ipl_database < 02_stadiums.sql
mysql -u username -p ipl_database < 03_series.sql
mysql -u username -p ipl_database < 04_umpires.sql
mysql -u username -p ipl_database < 11_users.sql
```

### Load from Application

```javascript
// Using the Node.js initialization script:
npm run init-db

// This will load schema and basic data automatically
```

## Data Statistics

-  **Teams**: 10 IPL franchises
-  **Stadiums**: 15 cricket venues
-  **Series**: 5 IPL seasons (2021-2025)
-  **Umpires**: 20 professional umpires
-  **Players**: 50+ players across all teams
-  **Matches**: 25+ sample matches including playoffs
-  **Scorecards**: Batting and bowling data for completed matches
-  **Team Stats**: Performance data for multiple seasons
-  **Player Stats**: Individual performance metrics
-  **Users**: 20+ authentication users with different roles

## Data Quality

-  All data follows proper referential integrity
-  Realistic player prices, statistics, and performance data
-  Proper match results with scorecards
-  Comprehensive team and player statistics
-  Multiple user roles for testing authentication

## Customization

Each file can be modified independently to:

-  Add more teams, players, or matches
-  Update player prices and statistics
-  Add historical data from previous IPL seasons
-  Customize user roles and permissions
-  Add more stadiums and venues

## Testing

The sample data is designed for:

-  API endpoint testing
-  Frontend component development
-  Database query optimization
-  Report generation testing
-  User authentication testing

## Production Notes

Before using in production:

-  Remove test users from `11_users.sql`
-  Update password hashes with proper bcrypt encryption
-  Validate all statistics and performance data
-  Add data validation constraints as needed
-  Consider data privacy and security requirements
