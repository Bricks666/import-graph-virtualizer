FROM node:alpine as builder
WORKDIR /app
RUN apk --no-cache add --virtual builds-deps build-base python3
COPY package*.json .
RUN npm ci
COPY ./prisma ./prisma
RUN npx prisma generate
COPY . /app
RUN npm run build

FROM node:alpine
WORKDIR /app
RUN chown node -R .
USER node
COPY --from=builder /app/package*.json ./
RUN npm ci prisma --omit=dev --ignore-scripts
RUN npm ci --omit=dev --ignore-scripts
RUN npm rebuild
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate
COPY --from=builder --chown=node /app/dist ./
EXPOSE ${PORT}
CMD ["npm", "run", "start:prod"]
