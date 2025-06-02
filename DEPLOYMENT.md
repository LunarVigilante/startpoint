# StartPoint Deployment Guide

This guide covers deploying StartPoint to Vercel with various database options.

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `startpoint` (or your preferred name)
   - Directory: `./` (current directory)

### Option 2: Deploy via GitHub Integration

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/startpoint.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure settings (see below)

## 🗄️ Database Setup

### Option A: Supabase (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Configure Environment Variables**
   ```env
   DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
   ```

3. **Set up Database Schema**
   ```bash
   npx prisma db push
   ```

### Option B: Neon

1. **Create Neon Project**
   - Go to [neon.tech](https://neon.tech)
   - Create new project
   - Copy connection string

2. **Configure Environment Variables**
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
   ```

### Option C: PlanetScale

1. **Create PlanetScale Database**
   - Go to [planetscale.com](https://planetscale.com)
   - Create new database
   - Create branch and get connection string

2. **Update Prisma Schema**
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
     relationMode = "prisma"
   }
   ```

## ⚙️ Environment Variables

### Required Variables

Set these in your Vercel dashboard under Project Settings > Environment Variables:

```env
# Database (choose one option above)
DATABASE_URL="your-database-connection-string"

# Application
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NEXT_PUBLIC_APP_NAME="StartPoint"
```

### Optional Variables

```env
# Authentication (if using Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Supabase (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="your-analytics-id"
```

## 🔧 Build Configuration

### Vercel Configuration

Create `vercel.json` in your project root:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_APP_NAME": "StartPoint"
  }
}
```

### Build Settings in Vercel Dashboard

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: Leave empty (Next.js default)
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

## 🚦 Post-Deployment Steps

### 1. Database Setup

After deployment, set up your database:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed
```

### 2. Verify Deployment

1. **Check Application**
   - Visit your deployed URL
   - Verify all pages load correctly
   - Test navigation between sections

2. **Check Database Connection**
   - Try creating a test asset or user
   - Verify data persistence

3. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor function execution times
   - Review any error logs

### 3. Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to Project Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_APP_URL="https://yourdomain.com"
   ```

## 🔒 Security Considerations

### Environment Variables

- Never commit `.env.local` to version control
- Use Vercel's environment variable encryption
- Rotate database credentials regularly

### Database Security

- Enable SSL connections
- Use connection pooling for production
- Set up database backups
- Monitor for unusual access patterns

### Application Security

- Enable CORS protection
- Implement rate limiting for APIs
- Use HTTPS only in production
- Regular security updates

## 📊 Monitoring and Analytics

### Vercel Analytics

Enable in your Vercel dashboard:
- Real User Monitoring (RUM)
- Web Vitals tracking
- Function performance metrics

### Error Tracking

Consider adding Sentry for error tracking:

```bash
npm install @sentry/nextjs
```

### Database Monitoring

- Set up connection pool monitoring
- Track query performance
- Monitor database size and growth

## 🔄 CI/CD Pipeline

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

### Custom Deployment Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test
      - name: Build application
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors: `npm run type-check`
   - Verify all dependencies are installed
   - Check for missing environment variables

2. **Database Connection Issues**
   - Verify connection string format
   - Check database server status
   - Ensure SSL settings are correct

3. **Runtime Errors**
   - Check Vercel function logs
   - Verify environment variables are set
   - Monitor database connection limits

### Getting Help

- Check Vercel deployment logs
- Review Next.js build output
- Monitor database connection status
- Check browser console for client-side errors

## 📈 Scaling Considerations

### Performance Optimization

- Enable Vercel Edge Functions for global distribution
- Implement database connection pooling
- Use Vercel's Image Optimization
- Enable static generation where possible

### Database Scaling

- Monitor connection pool usage
- Consider read replicas for heavy read workloads
- Implement caching strategies
- Plan for data archival

---

**Need help?** Check the [main README](README.md) or create an issue in the GitHub repository. 