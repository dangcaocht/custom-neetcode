FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install serve - a simple static file server
RUN npm install -g serve

# Copy the frontend file
COPY index.html .

# Expose port
EXPOSE 80

# Start the static file server
CMD ["serve", "-s", ".", "-l", "80"]