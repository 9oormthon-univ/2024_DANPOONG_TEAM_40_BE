module.exports = {
    apps: [
      {
        name: "moduegil-be", // 애플리케이션 이름
        script: "index.js", // 애플리케이션 실행 파일
        instances: "max", // 클러스터 모드에서 CPU 코어 수만큼 실행
        exec_mode: "cluster", // 클러스터 모드
        env: {
          NODE_ENV: "production", // 환경 변수 설정
        },
      },
    ],
    deploy: {
        production: {
          user: "ubuntu", // 서버의 사용자 이름
          host: "13.209.156.54", // 서버의 IP 주소
          ref: "origin/main", // 배포할 브랜치
          repo: "git@github.com:9oormthon-univ/2024_DANPOONG_TEAM_40_BE.git", // Git 저장소
          path: "/var/www/moduegil-be", // 서버의 애플리케이션 경로
          "post-deploy":
            "npm install && pm2 reload ecosystem.config.js --env production",
        },
      },
    };