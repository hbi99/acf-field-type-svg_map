<?php

/*
Plugin Name: Advanced Custom Fields: SVG Map
Plugin URI: http://www.triggerfish.se
Description: Adds SVG Map field type for Advanced Custom Fields plugin
Version: 1.0.0
Author: Hakan Bilgin
Author URI: www.triggerfish.se
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/




// 1. set text domain
// Reference: https://codex.wordpress.org/Function_Reference/load_plugin_textdomain
load_plugin_textdomain( 'acf-svg_map', false, dirname( plugin_basename(__FILE__) ) . '/lang/' ); 




// 3. Include field type for ACF4
function register_fields_svg_map() {
	
	include_once('acf-svg_map-v4.php');
	
}

add_action('acf/register_fields', 'register_fields_svg_map');	



	
?>