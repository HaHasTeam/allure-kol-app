import React, { useState } from "react";
import { Image, ImageProps, ImageSourcePropType } from "react-native";

// Import the default fallback image
const fallBackImage = require("@/assets/images/fallBackImage.jpg");

interface ImageWithFallbackProps extends Omit<ImageProps, "source"> {
  source: ImageSourcePropType;
  fallbackSource?: ImageSourcePropType;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  source,
  fallbackSource = fallBackImage, // Set default fallback image
  ...props
}) => {
  const [imgSource, setImgSource] = useState<ImageSourcePropType>(source);
  console.log("imgSource", imgSource);

  const handleError = () => {
    // Only update the source if it's different from the fallback
    if (imgSource !== fallbackSource) {
      setImgSource(fallbackSource);
    }
  };

  // Ensure the source is properly formatted
  const getValidSource = (src: ImageSourcePropType) => {
    // If it's a number (require('./image.png')), return as is
    if (typeof src === "number") {
      return src;
    }

    // If it's an object with uri
    if (src && typeof src === "object" && "uri" in src) {
      // Ensure uri is a string
      const uri = src.uri;
      if (uri === null || uri === undefined) {
        // If uri is null/undefined, use fallback
        return fallbackSource;
      }

      // Convert uri to string if it's not already
      return {
        ...src,
        uri: String(uri),
      };
    }

    // If we get here, the source is invalid, use fallback
    return fallbackSource;
  };

  return (
    <Image
      {...props}
      source={getValidSource(imgSource)}
      onError={handleError}
    />
  );
};

export default ImageWithFallback;
