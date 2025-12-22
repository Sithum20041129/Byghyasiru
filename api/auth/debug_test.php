<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Debug Test</h1>";

// 1. Test Helpers
echo "<h3>1. Loading Helpers</h3>";
try {
    $helpersPath = __DIR__ . '/../../helpers.php';
    echo "Path: $helpersPath<br>";
    if (file_exists($helpersPath)) {
        require_once $helpersPath;
        echo "<span style='color:green'>Helpers loaded successfully.</span><br>";
        echo "Timezone: " . date_default_timezone_get() . "<br>";
    } else {
        echo "<span style='color:red'>Helpers file not found!</span><br>";
    }
} catch (Throwable $e) {
    echo "<span style='color:red'>Helpers failed: " . $e->getMessage() . "</span><br>";
    echo "Trace: <pre>" . $e->getTraceAsString() . "</pre>";
}

// 2. Test Vendor
echo "<h3>2. Loading Vendor</h3>";
try {
    $vendorPath = __DIR__ . '/../vendor/autoload.php';
    echo "Path: $vendorPath<br>";
    
    if (file_exists($vendorPath)) {
        require_once $vendorPath;
        echo "<span style='color:green'>Vendor autoload loaded.</span><br>";
    } else {
        // Try root vendor
        $rootVendor = __DIR__ . '/../../vendor/autoload.php';
        echo "Checking root vendor: $rootVendor<br>";
        if (file_exists($rootVendor)) {
            require_once $rootVendor;
            echo "<span style='color:green'>Root vendor loaded.</span><br>";
        } else {
            echo "<span style='color:red'>Vendor autoload NOT found!</span><br>";
        }
    }
} catch (Throwable $e) {
    echo "<span style='color:red'>Vendor load failed: " . $e->getMessage() . "</span><br>";
}

// 3. Test Google Client
echo "<h3>3. Google Client</h3>";
if (class_exists('Google\Client')) {
    echo "<span style='color:green'>Google\Client class exists.</span><br>";
} else {
    echo "<span style='color:red'>Google\Client class NOT found.</span><br>";
}

echo "<br>Done.";
