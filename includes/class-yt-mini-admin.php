<?php
/**
 * Admin controller — registers settings, menu page, and plugin action links.
 *
 * @package YT_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class YT_Mini_Admin {

	/**
	 * Allowed position values.
	 *
	 * @var string[]
	 */
	private const POSITIONS = array(
		'top-left'     => 'Top Left',
		'top-right'    => 'Top Right',
		'bottom-left'  => 'Bottom Left',
		'bottom-right' => 'Bottom Right',
	);

	/**
	 * Plugin basename used for the action links filter.
	 *
	 * @var string
	 */
	private $basename;

	/**
	 * Hook into WordPress.
	 *
	 * @param string $basename Plugin basename (e.g. yt-mini/yt-mini.php).
	 */
	public function __construct( string $basename ) {
		$this->basename = $basename;

		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_menu', array( $this, 'add_menu' ) );
		add_filter( 'plugin_action_links_' . $this->basename, array( $this, 'action_links' ) );
	}

	/* ------------------------------------------------------------------ */
	/*  Settings API                                                       */
	/* ------------------------------------------------------------------ */

	/**
	 * Register the position option.
	 */
	public function register_settings() {
		register_setting( 'yt_mini_options', 'yt_mini_position', array(
			'type'              => 'string',
			'default'           => 'bottom-right',
			'sanitize_callback' => array( $this, 'sanitize_position' ),
		) );

		add_settings_section(
			'yt_mini_general',
			'',
			'__return_false',
			'yt-mini'
		);

		add_settings_field(
			'yt_mini_position',
			'Default Player Position',
			array( $this, 'render_position_field' ),
			'yt-mini',
			'yt_mini_general'
		);
	}

	/**
	 * Sanitize the position value.
	 *
	 * @param string $value Submitted value.
	 * @return string
	 */
	public function sanitize_position( $value ) {
		return array_key_exists( $value, self::POSITIONS ) ? $value : 'bottom-right';
	}

	/**
	 * Render the position picker field.
	 */
	public function render_position_field() {
		require YT_MINI_PATH . 'views/settings-position.php';
	}

	/* ------------------------------------------------------------------ */
	/*  Menu page                                                          */
	/* ------------------------------------------------------------------ */

	/**
	 * Register the options page under Settings.
	 */
	public function add_menu() {
		add_options_page(
			'YT Mini Settings',
			'YT Mini',
			'manage_options',
			'yt-mini',
			array( $this, 'render_page' )
		);
	}

	/**
	 * Render the settings page.
	 */
	public function render_page() {
		require YT_MINI_PATH . 'views/settings-page.php';
	}

	/* ------------------------------------------------------------------ */
	/*  Plugin action links                                                */
	/* ------------------------------------------------------------------ */

	/**
	 * Add a "Settings" link on the Plugins list page.
	 *
	 * @param string[] $links Existing links.
	 * @return string[]
	 */
	public function action_links( $links ) {
		$url  = admin_url( 'options-general.php?page=yt-mini' );
		$link = '<a href="' . esc_url( $url ) . '">Settings</a>';
		array_unshift( $links, $link );
		return $links;
	}

	/**
	 * Get the allowed positions (used by templates).
	 *
	 * @return string[]
	 */
	public static function get_positions() {
		return self::POSITIONS;
	}
}
