FROM node:lts-alpine

# https://hub.docker.com/r/labhackercd/alpine-python3-nodejs/dockerfile
RUN apk add --no-cache python python-dev python3 python3-dev \
    linux-headers build-base bash git ca-certificates && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --upgrade pip setuptools && \
    if [ ! -e /usr/bin/pip ]; then ln -s pip3 /usr/bin/pip ; fi && \
    rm -r /root/.cache

RUN mkdir -p /yuml
WORKDIR /yuml
COPY . /yuml

RUN npm install
RUN npm run build

RUN pip install -r requirements.txt

CMD ["npm", "run", "prod"]
