<?php
/**
 * Position picker field template.
 *
 * @package YT_Mini
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$current   = get_option( 'yt_mini_position', 'bottom-right' );
$positions = YT_Mini_Admin::get_positions();
?>
<style>
	.ytm-pos-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		max-width: 380px;
	}
	.ytm-pos-grid label {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		border: 2px solid #ddd;
		border-radius: 8px;
		cursor: pointer;
		transition: all .2s;
		background: #fff;
	}
	.ytm-pos-grid label:hover {
		border-color: #999;
	}
	.ytm-pos-grid input:checked + span {
		font-weight: 600;
	}
	.ytm-pos-grid label:has(input:checked) {
		border-color: #2271b1;
		background: #f0f6fc;
	}
</style>
<div class="ytm-pos-grid">
	<?php foreach ( $positions as $value => $label ) : ?>
		<label>
			<input type="radio" name="yt_mini_position" value="<?php echo esc_attr( $value ); ?>"
				<?php checked( $current, $value ); ?> />
			<span><?php echo esc_html( $label ); ?></span>
		</label>
	<?php endforeach; ?>
</div>
