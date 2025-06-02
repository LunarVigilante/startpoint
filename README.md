# StartPoint - Asset & Access Intelligence System

A comprehensive helpdesk-focused dashboard for tracking company assets, user access, and identifying department inconsistencies. Designed to scale from a single site (Anlin Clovis) to multiple companies (PGT Innovations, MITER Brands).

## 🚀 Features

### Core Functionality
- **Asset Management**: Track hardware assets, assignments, and maintenance
- **User Intelligence**: Monitor user profiles, licenses, and access permissions
- **Department Analysis**: Compare standardization across departments
- **Offboarding Tools**: Comprehensive checklists for employee departures
- **Smart Reporting**: Generate insights and export data

### Key Capabilities
- 📊 Real-time dashboard with anomaly detection
- 🔍 Advanced search and filtering
- 📈 Department health scoring
- 🚨 Automated anomaly identification
- 📋 Customizable offboarding checklists
- 📊 Comprehensive reporting suite

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Ready for Clerk or Auth0
- **Deployment**: Vercel
- **UI Components**: shadcn/ui with Lucide React icons

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd startpoint
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/startpoint_db"
   
   # Authentication (optional)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
   CLERK_SECRET_KEY=""
   
   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_NAME="StartPoint"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The application uses a comprehensive schema designed for multi-tenant support:

### Core Models
- **Site**: Multi-tenant support for future expansion
- **User**: Employee records with department tracking
- **Asset**: Hardware inventory with assignment history
- **UserLicense**: Software license tracking
- **UserGroup**: Active Directory group memberships
- **UserDistributionList**: Email distribution lists
- **DepartmentBaseline**: Standard configurations per department
- **AccessAnomaly**: Automated issue detection and suggestions

### Key Features
- Cascading deletes for data integrity
- JSON fields for flexible metadata storage
- Comprehensive audit trails
- Optimized for reporting queries

## 📱 Application Structure

### Pages
- `/` - Dashboard with overview and recent activity
- `/assets` - Asset inventory with advanced filtering
- `/users` - User directory with department grouping
- `/departments` - Department health analysis
- `/offboarding` - Employee departure management
- `/reports` - Analytics and data export

### Key Components
- **AssetQuickAssign**: Rapid asset assignment workflow
- **UserAnomalyCard**: Visual anomaly presentation
- **DepartmentHealthScore**: Standardization metrics
- **OffboardingChecklist**: Comprehensive departure tracking
- **SuggestionEngine**: Intelligent recommendations

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Configure environment variables in Vercel dashboard**
   - Add all production environment variables
   - Set up database connection

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Database Setup

For production, use one of these options:
- **Supabase**: Managed PostgreSQL with built-in auth
- **Neon**: Serverless PostgreSQL
- **PlanetScale**: MySQL-compatible serverless database
- **Railway**: Simple PostgreSQL hosting

## 🔧 Development

### Project Structure
```
startpoint/
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── assets/        # Asset management pages
│   │   ├── users/         # User management pages
│   │   ├── departments/   # Department analysis
│   │   ├── offboarding/   # Offboarding tools
│   │   └── reports/       # Reporting suite
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and configurations
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma schema
└── public/               # Static assets
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open database browser
- `npx prisma generate` - Generate Prisma client

## 🎯 Roadmap

### Phase 1: Foundation (Completed)
- ✅ Core UI components and layout
- ✅ Database schema design
- ✅ Basic CRUD operations
- ✅ Dashboard overview

### Phase 2: Intelligence Features
- 🔄 Anomaly detection algorithms
- 🔄 Department baseline management
- 🔄 Smart suggestions engine
- 🔄 Advanced reporting

### Phase 3: Automation
- 📋 Automated offboarding workflows
- 📋 Scheduled report generation
- 📋 Integration APIs
- 📋 Mobile optimization

### Phase 4: Scale
- 📋 Multi-tenant architecture
- 📋 Advanced analytics
- 📋 API for external integrations
- 📋 Enterprise features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the database schema in `prisma/schema.prisma`

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Database ORM by [Prisma](https://prisma.io/)
- Deployed on [Vercel](https://vercel.com/)

---

**StartPoint** - Streamlining asset and access management for modern organizations.
