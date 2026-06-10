@echo off
echo AllergyTrack - Helyi fejleszto szerver inditasa...
echo Megnyito: http://localhost:3131
start http://localhost:3131
npx serve www -p 3131 --no-clipboard
pause
