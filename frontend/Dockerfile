FROM acr-container-registry.cn-shanghai.cr.aliyuncs.com/beukay-basis/nginx:1.19

WORKDIR /usr/share/nginx/html/

COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf

COPY ./dist/index.html  /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]