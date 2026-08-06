import os

class AppiumConfig:
    # Appium Server Settings
    APPIUM_HOST = os.getenv("APPIUM_HOST", "127.0.0.1")
    APPIUM_PORT = int(os.getenv("APPIUM_PORT", 4723))
    APPIUM_SERVER_URL = f"http://{APPIUM_HOST}:{APPIUM_PORT}/wd/hub"

    # Android Emulator & Device Settings
    PLATFORM_NAME = "Android"
    PLATFORM_VERSION = os.getenv("ANDROID_VERSION", "14.0")
    DEVICE_NAME = os.getenv("EMULATOR_NAME", "Pixel_6_API_34")
    AUTOMATION_NAME = "UiAutomator2"
    
    # Application Paths
    APP_PACKAGE = "com.ciphereye.scamprotection"
    APP_ACTIVITY = "com.ciphereye.scamprotection.MainActivity"
    APP_PATH = os.getenv("APK_PATH", os.path.abspath("android/app/build/outputs/apk/debug/app-debug.apk"))

    # Capabilities Dict
    @classmethod
    def get_capabilities(cls):
        return {
            "platformName": cls.PLATFORM_NAME,
            "appium:platformVersion": cls.PLATFORM_VERSION,
            "appium:deviceName": cls.DEVICE_NAME,
            "appium:automationName": cls.AUTOMATION_NAME,
            "appium:app": cls.APP_PATH,
            "appium:appPackage": cls.APP_PACKAGE,
            "appium:appActivity": cls.APP_ACTIVITY,
            "appium:autoGrantPermissions": True,
            "appium:newCommandTimeout": 300,
            "appium:noReset": False
        }
