# AWS Deployment Guide

## 🚀 Deploy to AWS EC2

### Option A: AWS EC2 (Virtual Machine)

#### Step 1: Launch EC2 Instance
```bash
# Choose Ubuntu 22.04 LTS
# Instance type: t2.micro (free tier)
# Security Group: Allow HTTP (80), HTTPS (443), SSH (22), Custom TCP (3001)
```

#### Step 2: Connect and Setup
```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

#### Step 3: Deploy Application
```bash
# Clone or upload your project
git clone your-repo-url
# or upload via SCP/SFTP

cd PlaywrightMCP

# Install dependencies
npm install
cd web-ui
npm install
cd ..

# Start with PM2
pm2 start web-ui/server.js --name "bruno-generator"
pm2 startup
pm2 save
```

#### Step 4: Setup Nginx (Optional - for custom domain)
```bash
sudo apt install nginx

# Create nginx configuration
sudo nano /etc/nginx/sites-available/bruno-generator

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/bruno-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option B: AWS Elastic Beanstalk (Easier)

#### Step 1: Prepare for Deployment
```bash
# Install EB CLI
pip install awsebcli --upgrade --user

# Initialize Elastic Beanstalk
eb init

# Choose:
# - Region: us-east-1 (or your preferred)
# - Platform: Node.js
# - Application name: bruno-collection-generator
```

#### Step 2: Create Environment
```bash
eb create production

# This will:
# - Create load balancer
# - Auto-scaling group
# - Deploy your application
# - Provide public URL
```

### Option C: AWS Lambda + API Gateway (Serverless)

#### Requires modification for serverless architecture
```javascript
// Create serverless.yml or use AWS SAM
// Convert Express app to Lambda handlers
```

## 💰 Cost Estimates

### EC2 t2.micro (Free Tier)
- **Cost**: $0 for first 12 months
- **After**: ~$8-10/month
- **Best for**: Development/Testing

### Elastic Beanstalk
- **Cost**: ~$15-25/month
- **Best for**: Production with auto-scaling

### Lambda + API Gateway
- **Cost**: ~$1-5/month (pay per use)
- **Best for**: Low/Medium traffic

## 🔒 Security Considerations

```bash
# 1. Environment Variables
export DB_PASSWORD="your-secret"
export JWT_SECRET="your-jwt-secret"

# 2. HTTPS Setup with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# 3. Firewall Setup
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

## 📊 Monitoring & Logs

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs bruno-generator

# AWS CloudWatch integration
pm2 install pm2-cloudwatch
```