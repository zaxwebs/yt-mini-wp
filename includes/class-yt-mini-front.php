<?php
/**
 * Front-end controller — enqueues player assets and passes settings to JS.
 *
 * @package YT_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class YT_Mini_Front {

	/**
	 * Hook into WordPress.
	 */
	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * Enqueue CSS + JS on singular posts / pages.
	 */
	public function enqueue_assets() {
		if ( ! is_singular() ) {
			return;
		}

		wp_enqueue_style(
			'yt-mini',
			YT_MINI_URL . 'assets/css/yt-mini.css',
			array(),
			YT_MINI_VERSION
		);

		wp_enqueue_script(
			'yt-mini',
			YT_MINI_URL . 'assets/js/yt-mini.js',
			array(),
			YT_MINI_VERSION,
			true
		);

		wp_localize_script( 'yt-mini', 'ytMiniSettings', array(
			'position' => get_option( 'yt_mini_position', 'bottom-right' ),
		) );
	}
}
