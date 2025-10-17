# 🔧 Heroku Deployment Fix

## The Problem
Heroku is not installing devDependencies, so `vite` is not available during the build.

## ✅ Solution: Set Heroku Config Variable

Run this command to tell Heroku to install devDependencies:

```bash
heroku config:set NPM_CONFIG_PRODUCTION=false --app task-buddy-voice-755d36cec41f
```

This tells Heroku to install ALL dependencies (including devDependencies) so that `vite` is available for building.

## Then Redeploy

After setting the config variable:

```bash
git add .
git commit -m "Add heroku-postbuild script"
git push heroku main
```

## How It Works

1. Heroku installs ALL dependencies (including vite) because `NPM_CONFIG_PRODUCTION=false`
2. Heroku automatically runs `npm run heroku-postbuild` which builds your app
3. The built `dist` folder is created
4. Heroku runs `npm start` which serves the `dist` folder with `serve`
5. Your app is live! 🎉

## Verify It Worked

Check the logs:
```bash
heroku logs --tail --app task-buddy-voice-755d36cec41f
```

You should see:
```
-----> Installing dependencies
-----> Running heroku-postbuild
> vite build
✓ built in XXXms
-----> Starting server
> serve -s dist
```

## Alternative: Move Vite to Dependencies (Not Recommended)

If the above doesn't work, you can move vite to dependencies, but this is not ideal:

```bash
npm install --save vite @vitejs/plugin-react-swc
```

But it's better to use the `NPM_CONFIG_PRODUCTION=false` approach.

