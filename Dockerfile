FROM acr-container-registry.cn-shanghai.cr.aliyuncs.com/beukay-basis/beukay-jdk21:1.0
USER root
WORKDIR /tmp

# 编译 ffmpeg 8.1 from source（CentOS 7 EOL，devtoolset-11 + 自编 nasm 2.16）
RUN set -eux; \
    printf '[centos-sclo-rh]\nname=CentOS-7 SCLo rh\nbaseurl=https://mirrors.aliyun.com/centos-vault/7.9.2009/sclo/x86_64/rh/\ngpgcheck=0\nenabled=1\n[centos-sclo-sclo]\nname=CentOS-7 SCLo sclo\nbaseurl=https://mirrors.aliyun.com/centos-vault/7.9.2009/sclo/x86_64/sclo/\ngpgcheck=0\nenabled=1\n' > /etc/yum.repos.d/sclo.repo; \
    yum install -y devtoolset-11-gcc devtoolset-11-gcc-c++ devtoolset-11-binutils \
        make autoconf automake libtool pkgconfig \
        zlib-devel bzip2-devel xz-devel tar curl; \
    source /opt/rh/devtoolset-11/enable; \
    \
    # 编译 nasm 2.16.03（CentOS 7 默认 nasm 2.10 不支持 AVX-512） \
    curl -fL https://www.nasm.us/pub/nasm/releasebuilds/2.16.03/nasm-2.16.03.tar.xz -o nasm.tar.xz; \
    tar -xJf nasm.tar.xz; \
    cd nasm-2.16.03; \
    ./configure --prefix=/usr/local; \
    make -j"$(nproc)"; \
    make install; \
    cd /tmp; \
    rm -rf nasm-2.16.03 nasm.tar.xz; \
    \
    # 编译 ffmpeg \
    curl -fL https://ffmpeg.org/releases/ffmpeg-8.1.tar.xz -o ffmpeg.tar.xz; \
    tar -xJf ffmpeg.tar.xz; \
    cd ffmpeg-8.1; \
    ./configure \
        --prefix=/usr/local \
        --x86asmexe=/usr/local/bin/nasm \
        --disable-debug --disable-doc \
        --disable-htmlpages --disable-manpages --disable-podpages --disable-txtpages \
        --enable-gpl --enable-version3 \
        --disable-shared --enable-static; \
    make -j"$(nproc)"; \
    make install; \
    cd /; \
    rm -rf /tmp/ffmpeg* /usr/local/bin/nasm /usr/local/bin/ndisasm; \
    yum erase -y devtoolset-11-gcc devtoolset-11-gcc-c++ devtoolset-11-binutils \
        make autoconf automake libtool \
        zlib-devel bzip2-devel xz-devel || true; \
    yum clean all; \
    rm -rf /var/cache/yum /etc/yum.repos.d/sclo.repo; \
    /usr/local/bin/ffmpeg -version | head -1; \
    /usr/local/bin/ffprobe -version | head -1

WORKDIR /app
ARG JAR_FILE=marketing-person-infrastructure/target/*.jar
COPY ${JAR_FILE} /app/app.jar
RUN mkdir -p /app/cutmatrix-storage /app/logs && chown -R app:app /app
USER app
ENTRYPOINT java ${JAVA_OPTS} -jar /app/app.jar