#!/bin/bash

echo "Stripping bitcode from frameworks..."

APP_PATH="${TARGET_BUILD_DIR}/${WRAPPER_NAME}"

# Find all frameworks
find "$APP_PATH/Frameworks" -name '*.framework' -type d | while read -r FRAMEWORK
do
    FRAMEWORK_EXECUTABLE_NAME=$(basename "$FRAMEWORK" .framework)
    FRAMEWORK_EXECUTABLE_PATH="$FRAMEWORK/$FRAMEWORK_EXECUTABLE_NAME"

    if [ -f "$FRAMEWORK_EXECUTABLE_PATH" ]; then
        echo "Processing: $FRAMEWORK_EXECUTABLE_NAME"

        # Strip bitcode
        xcrun bitcode_strip "$FRAMEWORK_EXECUTABLE_PATH" -r -o "$FRAMEWORK_EXECUTABLE_PATH"

        # Codesign again
        /usr/bin/codesign --force --sign "${EXPANDED_CODE_SIGN_IDENTITY}" --preserve-metadata=identifier,entitlements "$FRAMEWORK_EXECUTABLE_PATH"

        echo "Stripped bitcode from: $FRAMEWORK_EXECUTABLE_NAME"
    fi
done

echo "Done stripping bitcode"
