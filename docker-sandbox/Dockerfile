FROM ubuntu:latest

RUN apt-get update

RUN apt-get install -y curl libglib2.0-0 libnss3 build-essential clang libdbus-1-dev libgtk-3-dev libnotify-dev libasound2-dev libcap-dev libcups2-dev libxtst-dev libxss1 libnss3-dev curl gperf bison python3-dbusmock openjdk-8-jre

RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

RUN groupadd -r test && useradd -r -g test test

RUN mkdir /home/test /app && \
    chown test:test /home/test /app

USER test

WORKDIR /app

COPY --chown=test:test ./example-electron-app .

RUN npm install

USER root

COPY ./fake_uname.so .

RUN chown root /app/node_modules/electron/dist/chrome-sandbox && \
    chmod 4755 /app/node_modules/electron/dist/chrome-sandbox

USER test

CMD ["npm", "run", "dev"]