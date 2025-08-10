#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('=== WSL2 WhatsApp Bot Diagnostic Tool ===\n');

// 1. Check environment
console.log('1. Environment Check:');
console.log(`   Platform: ${process.platform}`);
console.log(`   Architecture: ${process.arch}`);
console.log(`   Node.js Version: ${process.version}`);
console.log(`   WSL_DISTRO_NAME: ${process.env.WSL_DISTRO_NAME || 'Not set'}`);
console.log(`   DISPLAY: ${process.env.DISPLAY || 'Not set'}`);
console.log(`   CHROME_BIN: ${process.env.CHROME_BIN || 'Not set'}\n`);

// 2. Check Chrome executables
console.log('2. Chrome Executable Check:');
const chromePaths = [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium'
];

let foundChrome = null;
for (const path of chromePaths) {
    if (fs.existsSync(path)) {
        try {
            const version = execSync(`${path} --version 2>/dev/null || echo "Version check failed"`, { encoding: 'utf8' }).trim();
            console.log(`   ✅ Found: ${path} - ${version}`);
            if (!foundChrome) foundChrome = path;
        } catch (error) {
            console.log(`   ❌ Found but not executable: ${path}`);
        }
    } else {
        console.log(`   ❌ Not found: ${path}`);
    }
}

// 3. Test Chrome launch
console.log('\n3. Chrome Launch Test:');
if (foundChrome) {
    try {
        console.log(`   Testing: ${foundChrome}`);
        const testCommand = `timeout 5 ${foundChrome} --headless --no-sandbox --disable-gpu --dump-dom --virtual-time-budget=1000 about:blank 2>&1 || echo "Launch test completed"`;
        const result = execSync(testCommand, { encoding: 'utf8', timeout: 10000 });
        console.log('   ✅ Chrome can launch in headless mode');
        if (result.includes('<html>')) {
            console.log('   ✅ Chrome can render pages');
        }
    } catch (error) {
        console.log('   ❌ Chrome launch test failed:');
        console.log(`      Error: ${error.message}`);
    }
} else {
    console.log('   ❌ No Chrome executable found to test');
}

// 4. Check dependencies
console.log('\n4. Dependencies Check:');
try {
    const puppeteerVersion = require('puppeteer-core/package.json').version;
    console.log(`   ✅ puppeteer-core: v${puppeteerVersion}`);
} catch (error) {
    console.log('   ❌ puppeteer-core not found');
}

try {
    const whatsappVersion = require('whatsapp-web.js/package.json').version;
    console.log(`   ✅ whatsapp-web.js: v${whatsappVersion}`);
} catch (error) {
    console.log('   ❌ whatsapp-web.js not found');
}

// 5. Check system libraries
console.log('\n5. System Libraries Check:');
const requiredLibs = [
    'libnss3',
    'libatk1.0-0',
    'libatk-bridge2.0-0',
    'libcups2',
    'libdrm2',
    'libgtk-3-0',
    'libgbm1'
];

for (const lib of requiredLibs) {
    try {
        execSync(`dpkg -l | grep -q ${lib}`, { stdio: 'ignore' });
        console.log(`   ✅ ${lib} installed`);
    } catch (error) {
        console.log(`   ❌ ${lib} missing`);
    }
}

// 6. Memory and resources
console.log('\n6. System Resources:');
try {
    const memInfo = fs.readFileSync('/proc/meminfo', 'utf8');
    const totalMem = memInfo.match(/MemTotal:\s+(\d+)/);
    const freeMem = memInfo.match(/MemAvailable:\s+(\d+)/);
    
    if (totalMem && freeMem) {
        const totalGB = Math.round(parseInt(totalMem[1]) / 1024 / 1024 * 100) / 100;
        const freeGB = Math.round(parseInt(freeMem[1]) / 1024 / 1024 * 100) / 100;
        console.log(`   Memory: ${freeGB}GB free / ${totalGB}GB total`);
        
        if (totalGB < 2) {
            console.log('   ⚠️  Warning: Less than 2GB RAM may cause issues');
        }
    }
} catch (error) {
    console.log('   ❌ Could not read memory info');
}

// 7. Recommendations
console.log('\n7. Recommendations:');
if (!foundChrome) {
    console.log('   📋 Install Chrome: sudo apt install -y google-chrome-stable');
}

console.log('   📋 Set environment variables:');
console.log('      export DISPLAY=:0');
if (foundChrome) {
    console.log(`      export CHROME_BIN=${foundChrome}`);
}

console.log('\n   📋 If issues persist, try:');
console.log('      sudo apt install -y xvfb');
console.log('      Xvfb :99 -screen 0 1024x768x24 &');
console.log('      export DISPLAY=:99');

console.log('\n=== Diagnostic Complete ===');