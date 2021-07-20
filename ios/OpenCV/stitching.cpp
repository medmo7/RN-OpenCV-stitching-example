//
//  stitching.cpp
//  panoramicCamera
//
//  Created by Mohmed Bourga on 7/7/2021.
//




/////////////////////////
/*
 
 // stitching.cpp
 // adapted from stitching.cpp sample distributed with openCV source.
 // adapted by Foundry for iOS
 
 */



/*M///////////////////////////////////////////////////////////////////////////////////////
//
//  IMPORTANT: READ BEFORE DOWNLOADING, COPYING, INSTALLING OR USING.
//
//  By downloading, copying, installing or using the software you agree to this license.
//  If you do not agree to this license, do not download, install,
//  copy or use the software.
//
//
//                          License Agreement
//                For Open Source Computer Vision Library
//
// Copyright (C) 2000-2008, Intel Corporation, all rights reserved.
// Copyright (C) 2009, Willow Garage Inc., all rights reserved.
// Third party copyrights are property of their respective owners.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
//   * Redistribution's of source code must retain the above copyright notice,
//     this list of conditions and the following disclaimer.
//
//   * Redistribution's in binary form must reproduce the above copyright notice,
//     this list of conditions and the following disclaimer in the documentation
//     and/or other materials provided with the distribution.
//
//   * The name of the copyright holders may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
// This software is provided by the copyright holders and contributors "as is" and
// any express or implied warranties, including, but not limited to, the implied
// warranties of merchantability and fitness for a particular purpose are disclaimed.
// In no event shall the Intel Corporation or contributors be liable for any direct,
// indirect, incidental, special, exemplary, or consequential damages
// (including, but not limited to, procurement of substitute goods or services;
// loss of use, data, or profits; or business interruption) however caused
// and on any theory of liability, whether in contract, strict liability,
// or tort (including negligence or otherwise) arising in any way out of
// the use of this software, even if advised of the possibility of such damage.
//
//
 M*/
#include <iostream>
#include <fstream>


//openCV 2.4.x
//#include "opencv2/stitching/stitcher.hpp"

//openCV 3.x

#include "opencv2/imgcodecs.hpp"
#include "opencv2/highgui.hpp"
#include "opencv2/stitching.hpp"
#include <opencv2/stitching/warpers.hpp>


using namespace std;
using namespace cv;

bool try_use_gpu = false;
vector<Mat> imgs;
string result_name = "result.jpg";

void printUsage();
int parseCmdArgs(int argc, char** argv);


// Calculates rotation matrix given euler angles.
Mat eulerAnglesToRotationMatrix(Vec3f &theta)
{
    // Calculate rotation about x axis
    Mat R_x = (Mat_<float>(3,3) <<
               1,       0,              0,
               0,       cosf(theta[0]),   -sinf(theta[0]),
               0,       sinf(theta[0]),   cosf(theta[0])
               );

    // Calculate rotation about y axis
    Mat R_y = (Mat_<float>(3,3) <<
               cosf(theta[1]),    0,      sinf(theta[1]),
               0,               1,      0,
               -sinf(theta[1]),   0,      cosf(theta[1])
               );

    // Calculate rotation about z axis
    Mat R_z = (Mat_<float>(3,3) <<
               cosf(theta[2]),    -sinf(theta[2]),      0,
               sinf(theta[2]),    cosf(theta[2]),       0,
               0,               0,                  1);


    // Combined rotation matrix
    Mat R = R_z * R_y * R_x;

    return R;

}

Mat applySphericWraper(Mat normalPano) {
    // insert code here...
    std::cout << "Hello, World!\n";

//    Mat origImg = imread("..path to file..");
////    imshow("src", origImg);

    float scale = 100.0;
    float fx = 100, fy = 100, cx = 500, cy = 300;
    Vec3f rot = {};

    Mat dst;
    while (true) {
        cout << "•" << endl;
        cout << "Fx: " << fx << "; Fy: " << fy << endl;
        cout << "Cx: " << fx << "; Cy: " << fy << endl;
        cout << "Scale: " << scale << endl;
        cout << "Ang: " << rot << endl;

        detail::SphericalWarper wrap(scale);
        Mat K = (Mat_<float>(3,3) <<
                 fx, 0, cx,
                 0, fy, cy,
                 0, 0, 1);
        Mat R = eulerAnglesToRotationMatrix(rot);

        
        wrap.warp(normalPano, K, R, INTER_LINEAR, BORDER_CONSTANT, dst);
//        imshow("dst", dst);
        cout << dst.size() << endl;
        char c = waitKey();

        if (c == 'q') break;
        else if (c == 'a') fx += 10;
        else if (c == 'z') fx -= 10;
        else if (c == 's') fy += 10;
        else if (c == 'x') fy -= 10;
        else if (c == 'd') scale += 10;
        else if (c == 'c') scale -= 10;

        else if (c == 'f') rot[0] += 0.1;
        else if (c == 'v') rot[0] -= 0.1;
        else if (c == 'g') rot[1] += 0.1;
        else if (c == 'b') rot[1] -= 0.1;
        else if (c == 'h') rot[2] += 0.1;
        else if (c == 'n') rot[2] -= 0.1;
    }

    return dst;
}


Mat stitch (vector<Mat>& images)
{
  Stitcher::Mode mode = Stitcher::PANORAMA;
  imgs = images;
  Mat pano;
  try
  {
      Ptr<Stitcher> stitcher = Stitcher::create(mode);
      Stitcher::Status status = stitcher->stitch(imgs, pano);
//        Stitcher stitcher = Stitcher::createDefault(try_use_gpu);
//        Stitcher::Status status = stitcher.stitch(imgs, pano);
    
    if (status == Stitcher::OK)
        {
//          return applySphericWraper(pano);
          return pano;
        
        }else{
          cout << "Can't stitch images, error code = " << int(status) << endl;
              //return 0;
        }
 
    return pano;
  }
  catch( cv::Exception& e )
  {
      const char* err_msg = e.what();
      std::cout << "exception caught: " << err_msg << std::endl;
    return pano;
  }
  
   
}

//// DEPRECATED CODE //////
/*
 the code below this line is unused.
 it is derived from the openCV 'stitched' C++ sample
 left  in here only for illustration purposes
 
 - refactor main loop as member function
 - replace user input with iOS GUI
 - replace ouput with return value to CVWrapper
 
 */



////refactored as stitch function
//int deprecatedMain(int argc, char* argv[])
//{
//    int retval = parseCmdArgs(argc, argv);
//    if (retval) return -1;
//
//    Mat pano;
//    Stitcher stitcher = Stitcher::createDefault(try_use_gpu);
//    Stitcher::Status status = stitcher.stitch(imgs, pano);
//
//    if (status != Stitcher::OK)
//    {
//        cout << "Can't stitch images, error code = " << int(status) << endl;
//        return -1;
//    }
//
//    imwrite(result_name, pano);
//    return 0;
//}

//unused
void printUsage()
{
    cout <<
        "Rotation model images stitcher.\n\n"
        "stitching img1 img2 [...imgN]\n\n"
        "Flags:\n"
        "  --try_use_gpu (yes|no)\n"
        "      Try to use GPU. The default value is 'no'. All default values\n"
        "      are for CPU mode.\n"
        "  --output <result_img>\n"
        "      The default is 'result.jpg'.\n";
}

//all input passed in via CVWrapper to stitcher function
int parseCmdArgs(int argc, char** argv)
{
    if (argc == 1)
    {
        printUsage();
        return -1;
    }
    for (int i = 1; i < argc; ++i)
    {
        if (string(argv[i]) == "--help" || string(argv[i]) == "/?")
        {
            printUsage();
            return -1;
        }
        else if (string(argv[i]) == "--try_use_gpu")
        {
            if (string(argv[i + 1]) == "no")
                try_use_gpu = false;
            else if (string(argv[i + 1]) == "yes")
                try_use_gpu = true;
            else
            {
                cout << "Bad --try_use_gpu flag value\n";
                return -1;
            }
            i++;
        }
        else if (string(argv[i]) == "--output")
        {
            result_name = argv[i + 1];
            i++;
        }
        else
        {
            Mat img = imread(argv[i]);
            if (img.empty())
            {
                cout << "Can't read image '" << argv[i] << "'\n";
                return -1;
            }
            imgs.push_back(img);
        }
    }
    return 0;
}
