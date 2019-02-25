// this script is for optimizing images

// if you want to copy paste a whole folder from scp it can be useful to do it with this.
// the website already does this on upload, so don't worry about it if you are just uploading individual images via /admin 

var compress_images = require('compress-images'), INPUT_path_to_your_images, OUTPUT_path;
var fs = require('fs');


INPUT_path_to_your_images = __dirname + '/assets/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}'
OUTPUT_path = __dirname + '/optimized/';

compress_images(INPUT_path_to_your_images, OUTPUT_path, {compress_force: false, statistic: true, autoupdate: true}, false,
                                            {jpg: {engine: 'mozjpeg', command: ['-quality', '60']}},
                                            {png: {engine: 'pngquant', command: ['--quality=20-50']}},
                                            {svg: {engine: 'svgo', command: '--multipass'}},
                                            {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, function(error, completed, statistic){

            if(fs.existsSync(statistic.path_out_new)){
                fs.renameSync(statistic.path_out_new,statistic.input)
            }

            console.log('-------------');
            console.log(error);
            console.log(completed);
            console.log(statistic);
            console.log('-------------');
});
