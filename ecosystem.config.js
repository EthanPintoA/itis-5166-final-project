module.exports = {
  apps: [
    {
      name: "Express Server",
      cwd: "./backend",
      script: "npm run start",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "SvelteKit App",
      cwd: "./frontend",
      script: "npm run preview",
    },
  ],
};
