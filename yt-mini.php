<?php
/**
 * Plugin Name: YT Mini
 * Plugin URI:  https://github.com/your-repo/yt-mini
 * Description: Opens YouTube links in a sleek, draggable miniplayer instead of navigating away.
 * Version:     1.0.0
 * Author:      Zack Webster
 * License:     GPL-2.0-or-later
 * Text Domain: yt-mini
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'YT_MINI_VERSION', '1.0.0' );
define( 'YT_MINI_URL', plugin_dir_url( __FILE__ ) );
define( 'YT_MINI_PATH', plugin_dir_path( __FILE__ ) );

require_once YT_MINI_PATH . 'includes/class-yt-mini-front.php';
require_once YT_MINI_PATH . 'includes/class-yt-mini-admin.php';

// Boot front-end.
new YT_Mini_Front();

// Boot admin.
if ( is_admin() ) {
	new YT_Mini_Admin( plugin_basename( __FILE__ ) );
}
