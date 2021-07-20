#import "RNOpenCvLibrary.h"
#import <React/RCTLog.h>
#import <opencv2/imgcodecs.hpp>
#import <opencv2/opencv.hpp>
#import "UIImage+OpenCV.h"
#import "stitching.hpp"
#import "UIImage+Rotate.h"

////openCV 3.x
//#include "opencv2/stitching.hpp"


using namespace std;
using namespace cv;

@implementation RNOpenCvLibrary

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(addEvent:(NSString *)name location:(NSString *)location)
{
  RCTLogInfo(@"Pretending to create an event %@ at %@", name, location);
}


RCT_EXPORT_METHOD(checkForBlurryImage:(NSString *)imageAsBase64 callback:(RCTResponseSenderBlock)callback) {
  UIImage* image = [self decodeBase64ToImage:imageAsBase64];
  BOOL isImageBlurryResult = [self isImageBlurry:image];
  
  id objects[] = { isImageBlurryResult ? @YES : @NO };
  NSUInteger count = sizeof(objects) / sizeof(id);
  NSArray *dataArray = [NSArray arrayWithObjects:objects
                                           count:count];
  
  callback(@[[NSNull null], dataArray]);
}

RCT_EXPORT_METHOD(stitchImages:(NSArray *)imagesAsBase64 resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  @try{
    NSMutableArray * imagesArray = [self getUIImagesArray:imagesAsBase64 ];
    
    UIImage * resultImage = [self processWithArray:imagesArray];
    
    if (resultImage)
    {
      NSString * result64Based = [self encodeToBase64String: resultImage];
      resolve(@[result64Based]);
      
    }else{
      reject(@"Stitching operation failed",nil,nil);
    }}
  @catch (NSException *exception) {
    NSLog(@"%@", exception.reason);
    
  }
  
}

-(NSMutableArray*) getUIImagesArray:(NSArray *)imagesAsBase64Array {
  UIImage* image;
  NSMutableArray *imagesArray = [[NSMutableArray alloc] init];
  for (int i = 0; i< [imagesAsBase64Array count]; i++) {
    image = [self decodeBase64ToImage:imagesAsBase64Array[i]];
    [imagesArray insertObject:image atIndex:i ];
  }
  NSLog(@"%@",imagesArray);
  return imagesArray;
}


+ (UIImage*) processImageWithOpenCV: (UIImage*) inputImage
{
  NSArray* imageArray = [NSArray arrayWithObject:inputImage];
  UIImage* result = [[self class] processWithArray:imageArray];
  return result;
}

+ (UIImage*) processWithOpenCVImage1:(UIImage*)inputImage1 image2:(UIImage*)inputImage2;
{
  NSArray* imageArray = [NSArray arrayWithObjects:inputImage1,inputImage2,nil];
  UIImage* result = [[self class] processWithArray:imageArray];
  return result;
}

- (UIImage*) processWithArray:(NSArray*)imageArray
{
  @try {
    if ([imageArray count]==0){
      NSLog (@"imageArray is empty");
      return 0;
    }
    std::vector<cv::Mat> matImages;
    for (id image in imageArray) {
      if ([image isKindOfClass: [UIImage class]]) {
        /*
         All images taken with the iPhone/iPa cameras are LANDSCAPE LEFT orientation. The  UIImage imageOrientation flag is an instruction to the OS to transform the image during display only. When we feed images into openCV, they need to be the actual orientation that we expect them to be for stitching. So we rotate the actual pixel matrix here if required.
         */
        UIImage* rotatedImage = [image rotateToImageOrientation];
        cv::Mat matImage = [rotatedImage CVMat3];
        matImages.push_back(matImage);
      }
    }
    NSLog (@"stitching n1$$$$$$$$$$$$$");
    cv::Mat stitchedMat = stitch (matImages);
    NSLog (@"all stitching passed 0000000000++++++++++++****************");
    UIImage* result =  [UIImage imageWithCVMat:stitchedMat];
    return result;
  }
  @catch (NSException *exception) {
    NSLog(@"%@", exception.reason);
    
  }
  
}





- (cv::Mat)convertUIImageToCVMat:(UIImage *)image {
  CGColorSpaceRef colorSpace = CGImageGetColorSpace(image.CGImage);
  CGFloat cols = image.size.width;
  CGFloat rows = image.size.height;
  
  cv::Mat cvMat(rows, cols, CV_8UC4); // 8 bits per component, 4 channels (color channels + alpha)
  
  CGContextRef contextRef = CGBitmapContextCreate(cvMat.data,                 // Pointer to  data
                                                  cols,                       // Width of bitmap
                                                  rows,                       // Height of bitmap
                                                  8,                          // Bits per component
                                                  cvMat.step[0],              // Bytes per row
                                                  colorSpace,                 // Colorspace
                                                  kCGImageAlphaNoneSkipLast |
                                                  kCGBitmapByteOrderDefault); // Bitmap info flags

  CGContextDrawImage(contextRef, CGRectMake(0, 0, cols, rows), image.CGImage);
  CGContextRelease(contextRef);
  
  return cvMat;
}
-(UIImage *)UIImageFromCVMat:(cv::Mat)cvMat
{
  NSData *data = [NSData dataWithBytes:cvMat.data length:cvMat.elemSize()*cvMat.total()];
  CGColorSpaceRef colorSpace;
  if (cvMat.elemSize() == 1) {
    colorSpace = CGColorSpaceCreateDeviceGray();
  } else {
    colorSpace = CGColorSpaceCreateDeviceRGB();
  }
  CGDataProviderRef provider = CGDataProviderCreateWithCFData((__bridge CFDataRef)data);
  // Creating CGImage from cv::Mat
  CGImageRef imageRef = CGImageCreate(cvMat.cols,                                 //width
                                      cvMat.rows,                                 //height
                                      8,                                          //bits per component
                                      8 * cvMat.elemSize(),                       //bits per pixel
                                      cvMat.step[0],                            //bytesPerRow
                                      colorSpace,                                 //colorspace
                                      kCGImageAlphaNone|kCGBitmapByteOrderDefault,// bitmap info
                                      provider,                                   //CGDataProviderRef
                                      NULL,                                       //decode
                                      false,                                      //should interpolate
                                      kCGRenderingIntentDefault                   //intent
                                      );
  // Getting UIImage from CGImage
  UIImage *finalImage = [UIImage imageWithCGImage:imageRef];
  CGImageRelease(imageRef);
  CGDataProviderRelease(provider);
  CGColorSpaceRelease(colorSpace);
  return finalImage;
}



- (UIImage *)decodeBase64ToImage:(NSString *)strEncodeData {
  NSData *data = [[NSData alloc]initWithBase64EncodedString:strEncodeData options:NSDataBase64DecodingIgnoreUnknownCharacters];
  return [UIImage imageWithData:data];
}

- (NSString *)encodeToBase64String:(UIImage *)image {
  return [UIImagePNGRepresentation(image) base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength];
}

- (BOOL) isImageBlurry:(UIImage *) image {
  
  // converting UIImage to OpenCV format - Mat
  cv::Mat matImage = [self convertUIImageToCVMat:image];
  cv::Mat matImageGrey;
  // converting image's color space (RGB) to grayscale
//  cv::cvtColor(matImage, matImageGrey, CV_BGR2GRAY);
  cv::Mat dst2 = [self convertUIImageToCVMat:image];
  cv::Mat laplacianImage;
  dst2.convertTo(laplacianImage, CV_8UC1);
  
  // applying Laplacian operator to the image
  cv::Laplacian(matImageGrey, laplacianImage, CV_8U);
  cv::Mat laplacianImage8bit;
  laplacianImage.convertTo(laplacianImage8bit, CV_8UC1);
  
  unsigned char *pixels = laplacianImage8bit.data;
  
  // 16777216 = 256*256*256
  int maxLap = -16777216;
  for (int i = 0; i < ( laplacianImage8bit.elemSize()*laplacianImage8bit.total()); i++) {
    if (pixels[i] > maxLap) {
      maxLap = pixels[i];
    }
  }
  // one of the main parameters here: threshold sets the sensitivity for the blur check
  // smaller number = less sensitive; default = 180
  int threshold = 180;
  
  return (maxLap <= threshold);
}

@end
