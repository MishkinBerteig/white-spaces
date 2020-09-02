<?php
/*
  Plugin Name: White-Spaces
  Plugin URI: https://white-spaces.com
  description: Embed White-Spaces Whiteboards in Wordpress Posts
  Version: 1.0
  Author: MNT Research GmbH
  Author URI: https://mntre.com
  License: GPLv3+
*/

add_option("white_spaces_settings");

function white_spaces_apicall($method, $path, $data) {
	$white_spaces_api_base_uri = get_option("white_spaces_settings")[white_spaces_api_base_uri];
	$white_spaces_api_key = get_option("white_spaces_settings")[white_spaces_api_key];
	
	$data_string = json_encode($data);
	$url = $white_spaces_api_base_uri . $path;

	$headers = array(
		'Content-Type' => 'application/json',
		'X-White-Spaces-API-Token' => $white_spaces_api_key
	);
	
	$payload = array(
		'method' => $method,
		'timeout' => 10,
		'blocking' => true,
		'headers' => $headers,
		'body' => $data_string
	);

	// echo("<p>payload:</p><pre>");
	// print_r($payload);
	// echo("</pre>");
	
	$result = wp_remote_post($url, $payload);

	if (is_wp_error($result)) {
		return $result;
	}

	$result = json_decode($result[body], true);

	// echo("<p>decoded:</p><pre>");
	// print_r($result);
	// echo("</pre>");
	
	return $result;
}

function white_spaces_embed_space($slug, $width = '90%', $height = '800', $parent_space_id = null) {
	$white_spaces_frontend_base_uri = get_option("white_spaces_settings")[white_spaces_frontend_base_uri];

	// try to find the space identified by slug
	$space = white_spaces_apicall("GET", "/spaces/" . $slug, array());

	if (is_wp_error($space)) {
		$error = $response->get_error_message();
		return("<p><b>White-Spaces: WP Error looking up Space: $error</b></p>");
	} else if ($space[error] && $space[error]!="space_not_found") {
		return("<p><b>White-Spaces: Error looking up Space: $space[error]</b></p>");
	}

	// if it doesn't exist, create it:
	if ($space[error]=="space_not_found") {
		$data = array(
			"name" => $slug,
			"edit_slug" => $slug
		);

		if ($parent_space_id) {
			$data[parent_space_id] = $parent_space_id;
		}
		
		$space = white_spaces_apicall("POST", "/spaces", $data);

		if (is_wp_error($space)) {
			$error = $response->get_error_message();
			return("<p><b>White-Spaces: WP Error creating Space: $error</b></p>");
		} else if ($space[error]) {
			return("<p><b>White-Spaces: Error creating Space: $space[error]</b></p>");
		}
	}

	if (is_wp_error($space)) {
		$error = $response->get_error_message();
		return("<p><b>White-Spaces: WP Error embedding Space: $error</b></p>");
	} else if (!$space || $space[error]) {
		return("<p><b>White-Spaces: Error embedding Space. Is your API key set up correctly?</b></p>");
	}

	$space_auth = $space[edit_hash];
	
	// return a piece of html (iframe) embedding the space
	$uri = $white_spaces_frontend_base_uri . '/spaces/' . $slug . '?embedded=1&spaceAuth=' . $space_auth;
		
	$html = "<iframe src='$uri' class='white_spaces' width='$width' height='$height' style='max-width:100%' frameborder='0' allowFullScreen='true'></iframe>";

	return $html;
}

function white_spaces_shortcode($attrs) {
	extract(shortcode_atts(array(
		'id' => 'none',
		'parent_space_id' => null,
		'width' => '100%',
		'height' => '800'
	), $attrs));

	$w = $attrs[width];
	$h = $attrs[height];
	if (!$w) $w = '100%';
	if (!$h) $h = 800;

	return white_spaces_embed_space($attrs[id],$w,$h,$attrs[parent_space_id]);
}

add_shortcode('white_spaces_space', 'white_spaces_shortcode');

add_action('admin_menu', 'white_spaces_add_admin_menu');
add_action('admin_init', 'white_spaces_settings_init');

function white_spaces_add_admin_menu() { 
	add_options_page('white_spaces', 'White-Spaces', 'manage_options', 'white_spaces', 'white_spaces_options_page');
}

function white_spaces_settings_init() { 
	register_setting('pluginPage', 'white_spaces_settings');

	add_settings_section(
		'white_spaces_pluginPage_section', 
		'White-Spaces Settings', 
		'white_spaces_settings_section_callback', 
		'pluginPage'
	);

	add_settings_field(
		'white_spaces_text_field_0', 
		'API key',
		'white_spaces_text_field_0_render', 
		'pluginPage', 
		'white_spaces_pluginPage_section' 
	);

	add_settings_field(
		'white_spaces_text_field_1', 
		'API base URL', 
		'white_spaces_text_field_1_render', 
		'pluginPage', 
		'white_spaces_pluginPage_section' 
	);

	add_settings_field(
		'white_spaces_text_field_2', 
		'Frontend base URL',
		'white_spaces_text_field_2_render', 
		'pluginPage',
		'white_spaces_pluginPage_section' 
	);
}

function white_spaces_text_field_0_render() {
	$opts = get_option('white_spaces_settings');
	?>
	<input type='text' name='white_spaces_settings[white_spaces_api_key]' value='<?php echo $opts[white_spaces_api_key]; ?>'>
<?php
}

function white_spaces_text_field_1_render() { 
	$opts = get_option('white_spaces_settings');
	?>
	<input type='text' name='white_spaces_settings[white_spaces_api_base_uri]' value='<?php echo $opts[white_spaces_api_base_uri]; ?>'>
<?php
}

function white_spaces_text_field_2_render() { 
	$opts = get_option('white_spaces_settings');
	?>
	<input type='text' name='white_spaces_settings[white_spaces_frontend_base_uri]' value='<?php echo $opts[white_spaces_frontend_base_uri]; ?>'>
<?php
}

function white_spaces_settings_section_callback() { 
	echo '';
}

function white_spaces_options_page() {
	?>
	<form action='options.php' method='post'>
<?php
	settings_fields('pluginPage');
	do_settings_sections('pluginPage');
	submit_button();
	?>
	</form>
<?php
}


?>
