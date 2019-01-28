<?php
/*
Plugin Name: DesignBold Design Button
Plugin URI: https://www.designbold.com/collection/create-new
Description: Desingbold designit build plugin allow designning image online
Version: 1.0.0
Author: DesignBold
Author URI: https://www.designbold.com/
License: GPLv2 or later
*/

/*
Plugin used to Wordpress version 5.0 integration the Gutenberg editor.

{Designit} is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
any later version.

{Designit} is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with {Designit}. If not, see {Plugin URI}.
*/

defined('ABSPATH') or die('No script kiddies please!');

// Define plugin version
define('DBDB_VERSION', '1.0.0');

// Define plugin prefix
define('DBDB', 'designbold-design-button');

// Define block register
define('DBDB_BLOCK', DBDB . '/design-button');

// Define designbold config localization
define('DBDB_CFLZ', 'DESIGNBOLDCF');

function DBDB_init_localize_script()
{
    global $post;

    if ($post) {
        $postID = $post->ID;
    } else $postID = 0;

    wp_enqueue_style(
        DBDB . 'main',
        plugins_url('assets/css/main.css', __FILE__),
        array('wp-edit-blocks'), // Dependency to include the CSS after it.
        filemtime(plugin_dir_path(__FILE__) . 'assets/css/main.css')
    );

    wp_localize_script(DBDB . 'button', 'WPURLS', array('siteurl' => get_option('siteurl'), 'post_id' => $postID));

    wp_localize_script(
        DBDB . 'editor_script',
        DBDB_CFLZ,
        array(
            'plugin_prefix' => DBDB,
            'block' => DBDB_BLOCK,
            'post_id' => $postID
        )
    );
}

function DBDB_gutenberg_boilerplate_block()
{
    if (!function_exists('register_block_type')) {
        // Gutenberg is not active.
        return;
    }

    wp_register_script(
        DBDB . 'button',
        plugins_url('assets/js/button.js', __FILE__),
        array('wp-blocks', 'wp-components', 'wp-element', 'wp-i18n', 'wp-editor'),
        filemtime(plugin_dir_path(__FILE__) . 'assets/js/button.js'),
        true
    );

    wp_register_script(
        DBDB . 'editor_script',
        plugins_url('assets/js/editor_script.js', __FILE__),
        array('wp-blocks', 'wp-components', 'wp-element', 'wp-i18n', 'wp-editor'), // Dependencies, defined above.
        filemtime(plugin_dir_path(__FILE__) . 'assets/js/editor_script.js'),
        true
    );

    wp_register_style(
        DBDB . 'editor_style',
        plugins_url('assets/css/editor_style.css', __FILE__),
        array(), // Dependency to include the CSS after it.
        filemtime(plugin_dir_path(__FILE__) . 'assets/css/editor_style.css'),
        true
    );

    /*
    * editor_script – Scripts loaded only within the editor. This is where you will enqueue the block.js file.
    * editor_style – Styles loaded only within the editor.
    * script – Scripts loaded both within the editor and the frontend of the site.
    * style – Styles loaded both within the editor and the frontend of the site.
    * render_callback - run callback function when registed
    */

    register_block_type(DBDB_BLOCK, array(
        'script' => DBDB . 'button',
        'editor_script' => DBDB . 'editor_script',
        'editor_style' => DBDB . 'editor_style'
    ));
}

add_action('init', 'DBDB_gutenberg_boilerplate_block');
add_action('admin_enqueue_scripts', 'DBDB_init_localize_script');

/**
 * Build endpoint to download image
 *
 */
function DBDB_fileType($fileType = NULL)
{
    $result = '';
    $arr = array(
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'gif' => 'image/gif',
        'bmp' => 'image/bmp',
        'tif' => 'image/tiff',
        'svg' => 'image/svg+xml',
    );

    foreach ($arr as $key => $value) {
        if ($value == $fileType) {
            $result = $key;
        }
    }

    return $result;
}

// Ajax download image
add_action('wp_ajax_nopriv_dbdb_download_image', 'nopriv_dbdb_download_image');
add_action('wp_ajax_dbdb_download_image', 'dbdb_download_image');
function dbdb_download_image()
{
    $flag = true;
    $post_id = $_REQUEST['post_id'] ? (int)$_REQUEST['post_id'] : 0;
    $image_url = esc_url_raw($_POST['image_url']);
    $image_name = sanitize_text_field($_POST['image_name']);

    if (isset($image_url) && $image_url != '' && $image_name != '' && get_post_status($post_id)) {
        $file_array = array();
        $file_array['tmp_name'] = download_url($image_url);

        // Get info image
        $fileType = getimagesize($file_array['tmp_name']);
        $image_type = $fileType[2];

        // Check file_array is an image or not
        if (!in_array($image_type, array(IMAGETYPE_GIF, IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_BMP))) {
            $flag = false;
        }

        // Check image name extension
        $ex = DBDB_fileType($fileType['mime']);

        if ($ex != '' && $flag == true) {
            $file_array['name'] = $image_name . '.' . $ex;

            if (is_wp_error($file_array['tmp_name'])) {
                @unlink($file_array['tmp_name']);
                return new WP_Error('grabfromurl', 'Could not download image from remote source');
            }

            $attachmentId = media_handle_sideload($file_array, $post_id);

            $obj_data = (object)[];

            if ($attachmentId) {
                // create the thumbnails
                $attach_data = wp_generate_attachment_metadata($attachmentId, get_attached_file($attachmentId));

                wp_update_attachment_metadata($attachmentId, $attach_data);

                // Get image info in media library after upload image on wordpress
                $arr_info_image = wp_get_attachment_image_src($attachmentId, array('700', '600'), "", array("class" => "img-responsive"));

                $arr_temp = array(
                    'url' => trim($arr_info_image[0]),
                    'width' => trim($arr_info_image[1]),
                    'height' => trim($arr_info_image[2]),
                    'is_intermediate' => trim($arr_info_image[3])
                );
                $obj_data->image_info = $arr_temp;
                $obj_data->post_id = trim($post_id);
            }
            header("Content-type:application/json;charset=utf-8");
            print_r(trim(json_encode($obj_data)));
        }
    } else {
        $arr_error = (object)[];
        $arr_error->error = 'Url is not image!';
        echo json_encode($arr_error);
    }
}

function nopriv_dbdb_download_image()
{
    $arr_error = (object)[];
    $arr_error->error = 'You might not permission to access endpoint!';
    echo json_encode($arr_error);
}
