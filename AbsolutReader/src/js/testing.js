<TextInput placeholder="Name of character"
onChangeText={(text) => this.chaimager_cache_name(text)}/>

<TextInput	placeholder= "Small biography"
onChangeText={(text) => this.chaimager_cache_bio(text)}
/>

<ColorPicker
onColorChangeComplete={(color) => this.chaimager_chache_color(color)}
thumbSize={40}
sliderSize={40}
noSnap={true}
row={true}
/>

<Button onPress={this.chaimager_cache_image}  
title="Select Image"  />

<Button onPress={this.chaimager_cache_save}  
title="Save"  />