FROM node:20-bookworm-slim

EXPOSE 4173 5173

RUN apt-get update -y \
  && DEBIAN_FRONTEND=noninteractive \
  apt-get install -y --no-install-recommends \
  ca-certificates \
  git \
  openssh-client \
  gnupg \
  && update-ca-certificates \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

USER node

WORKDIR /home/node/workspace
