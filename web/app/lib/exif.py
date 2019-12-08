#!/usr/bin/env python
# -*- coding:utf8 -*-
"""
 Copyright (c) 2019 Baidu.com, Inc. All Rights Reserved
 Author: Zhao Penghao, zhaopenghao@baidu.com
 Create Time: 2019/3/18 上午10:50
"""

# import urllib.request
# import urllib.parse
import os
import sys
from PIL import Image
from PIL.ExifTags import TAGS


def get_exif_data(fname):
    """Get embedded EXIF data from image file."""
    ret = {}
    try:
        img = Image.open(fname)
        if hasattr(img, '_getexif' ):
            exifinfo = img._getexif()
            if exifinfo != None:
                for tag, value in exifinfo.items():
                    decoded = TAGS.get(tag, tag)
                    ret[decoded] = value
    except IOError:
        print ('IOERROR ' + fname)
    return ret

def rm_exifInfo(download_dir, out_dir):
    """移除exif信息"""
    img_list = os.listdir(download_dir)
    for f in img_list:
        image_file = os.path.join(download_dir, f)
        print("image file:{} ,\nexif info:{}".format(f, get_exif_data(image_file)))
        image = Image.open(image_file)
        # next 3 lines strip exif
        try:
            for orientation in TAGS.keys():
                if TAGS[orientation] == 'Orientation': break

            print("exif :{}".format(image._getexif()))
            if image._getexif() is not None:
                exif = dict(image._getexif().items())
                if exif.has_key(orientation):
                    print("{} is {}".format(orientation, exif[orientation]))
                    if exif[orientation] == 3:
                        image = image.rotate(180, expand=True)
                    elif exif[orientation] == 6:
                        image = image.rotate(270, expand=True)
                    elif exif[orientation] == 8:
                        image = image.rotate(90, expand=True)

        except AttributeError:
            image = image
        data = list(image.getdata())
        image_without_exif = Image.new(image.mode, image.size)
        image_without_exif.putdata(data)
        image_without_exif.save(os.path.join(out_dir, f))

inputDir = sys.argv[1];
outputDir = sys.argv[2];
rm_exifInfo(inputDir, outputDir)