#!/bin/bash

echo "=== Different Testing Approaches ==="

echo "1. Test with minimal app (no Firebase):"
echo "   cp App-minimal.js App.js"
echo "   eas build --profile testflight --platform ios"

echo ""
echo "2. Get device logs from Console.app:"
echo "   - Connect iPhone via USB"
echo "   - Open Console.app"
echo "   - Select your device"
echo "   - Filter: NumaHealthApp"
echo "   - Launch app and watch logs"

echo ""
echo "3. Check TestFlight crash reports:"
echo "   open https://appstoreconnect.apple.com"
echo "   - My Apps → Numa Health App → TestFlight → Crashes"

echo ""
echo "4. Use Xcode to get symbolicated crash logs:"
echo "   - Window → Devices and Simulators"
echo "   - Select device → View Device Logs"
echo "   - Look for NumaHealthApp crashes"

echo ""
echo "5. Try development build on device:"
echo "   npx expo run:ios --device"
echo "   - This will show console logs!"

echo ""
echo "6. Add visible debug info to screen:"
echo "   - Add a Text component showing 'App loaded at: {timestamp}'"
echo "   - If you see this text, JS is loading"
echo "   - If not, it's a native/bundling issue" 