<?php
/**
 * Settings page template.
 *
 * @package YT_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="wrap">
	<h1>YT Mini Settings</h1>
	<form method="post" action="options.php">
		<?php
		settings_fields( 'yt_mini_options' );
		do_settings_sections( 'yt-mini' );
		submit_button();
		?>
	</form>
</div>
