# IPL Database Management System

A comprehensive database management system for the Indian Premier League (IPL) built with modern web technologies.

![IPL DBMS Logo](https://img.shields.io/badge/IPL-DBMS-orange?style=for-the-badge&logo=cricket)

## 🏏 Features

-  **Team Management**: Manage IPL teams, their details, and squad information
-  **Player Database**: Comprehensive player profiles with statistics and performance data
-  **Match Management**: Schedule matches, record results, and track match details
-  **Statistics & Analytics**: Player performance, team standings, and detailed analytics
-  **User Authentication**: Secure login system with role-based access
-  **Responsive Design**: Works seamlessly on desktop and mobile devices
-  **Dark/Light Theme**: Customizable theme preferences

## 🛠️ Tech Stack

### Frontend

-  **Next.js 15.3.2** - React framework with server-side rendering
-  **React 19** - UI library
-  **Tailwind CSS** - Utility-first CSS framework
-  **Shadcn UI** - High-quality UI components
-  **React Icons** - Icon library
-  **React Hook Form** - Form validation
-  **Zod** - Schema validation
-  **Next Themes** - Theme management

### Backend

-  **Next.js API Routes** - Serverless API endpoints
-  **MySQL** - Relational database
-  **NextAuth.js** - Authentication
-  **bcrypt** - Password hashing

## 📋 Prerequisites

-  Node.js (v18 or higher)
-  MySQL server (v8.0 or higher)
-  npm or yarn package manager

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd ipl-dbms
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Update the `.env.local` file with your MySQL credentials:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=ipl_database

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Application Environment
NODE_ENV=development
```

### 4. Initialize the database

```bash
npm run init-db
# or
yarn init-db
```

This will:

-  Create the `ipl_database` database
-  Set up all required tables with proper relationships
-  Insert sample data for teams, stadiums, and series
-  Create a default admin user

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📊 Database Schema

The database follows a comprehensive cricket/IPL structure with the following main entities:

### Core Tables

-  **Teams**: IPL team information and details
-  **Players**: Player profiles and team associations
-  **Stadiums**: Venue information and capacities
-  **Series**: IPL seasons and tournament details
-  **Matches**: Match fixtures and results
-  **Umpires**: Umpire information

### Scorecard Tables

-  **BattingScorecard**: Individual batting performances
-  **BowlingScorecard**: Individual bowling performances

### Statistics Tables

-  **TeamStats**: Team performance statistics per series
-  **PlayerStats**: Player statistics aggregated by series

### Authentication

-  **Users**: System users with role-based access

### Views

-  **MatchResults**: Complete match information with team names
-  **PlayerPerformance**: Batting statistics view
-  **BowlingPerformance**: Bowling statistics view

## 🔐 Default Credentials

-  **Email**: admin@ipl.com
-  **Password**: admin123
-  **Role**: Admin

## 🎯 Key Features

### 1. Team Management

-  View all IPL teams with their details
-  Add new teams or update existing ones
-  Manage team captains and coaching staff
-  Track team statistics and performance

### 2. Player Database

-  Comprehensive player profiles
-  Role-based categorization (Batsman, Bowler, All-rounder, Wicket-keeper)
-  Contract values and team assignments
-  Performance statistics tracking

### 3. Match Management

-  Schedule new matches
-  Record match results and scorecards
-  Track toss decisions and match outcomes
-  Man of the match selections

### 4. Statistics & Analytics

-  Player performance metrics
-  Team standings and points table
-  Historical data analysis
-  Export capabilities for reports

### 5. User Roles

-  **Admin**: Full system access
-  **Scorer**: Match data entry and updates
-  **Viewer**: Read-only access to statistics

## 🏗️ Project Structure

```
ipl-dbms/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── teams/             # Team management pages
│   │   ├── players/           # Player management pages
│   │   ├── matches/           # Match management pages
│   │   └── statistics/        # Statistics and analytics
│   ├── components/            # Reusable React components
│   │   └── ui/               # UI components (Shadcn)
│   ├── lib/                  # Utility functions and configurations
│   └── types/                # TypeScript type definitions
├── scripts/                  # Database and utility scripts
├── database.sql             # Database schema and sample data
└── package.json            # Project dependencies and scripts
```

## 🔧 Available Scripts

-  `npm run dev` - Start development server
-  `npm run build` - Build for production
-  `npm run start` - Start production server
-  `npm run lint` - Run ESLint
-  `npm run init-db` - Initialize database

## 📱 Responsive Design

The application is fully responsive and optimized for:

-  **Desktop computers** (1200px+)
-  **Tablets** (768px - 1199px)
-  **Mobile phones** (320px - 767px)

## 🎨 Theme Support

-  **Light Mode**: Clean, bright interface
-  **Dark Mode**: Eye-friendly dark interface
-  **System Default**: Automatically matches system preferences

Theme preferences are saved locally for consistent experience.

## 🚀 Deployment

### Building for Production

```bash
npm run build
npm run start
```

### Environment Variables for Production

Ensure all environment variables are properly set in your production environment:

```env
MYSQL_HOST=your_production_db_host
MYSQL_USER=your_production_db_user
MYSQL_PASSWORD=your_production_db_password
MYSQL_DATABASE=ipl_database
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

-  Create an issue in the repository
-  Contact the development team

## 🙏 Acknowledgments

-  Inspired by the cricket database structure from [iamrajee/dbms_cricket_database](https://github.com/iamrajee/dbms_cricket_database)
-  Architecture patterns from [elsesourav/attendance-system](https://github.com/elsesourav/attendance-system)
-  UI components from [Shadcn UI](https://ui.shadcn.com/)
-  Icons from [Lucide React](https://lucide.dev/)

---

**Developed with ❤️ for cricket enthusiasts and database management**
