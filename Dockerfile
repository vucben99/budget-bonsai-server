FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN tsc
EXPOSE 8000
CMD ["npm", "start"]