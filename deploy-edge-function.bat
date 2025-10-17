@echo off
echo Deploying weekly-digest Edge Function...
echo.
cd /d "%~dp0"
supabase functions deploy weekly-digest
echo.
echo Deployment complete!
echo You can now test the email function in your app.
pause

