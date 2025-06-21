# File renderer plugin for tiptap

This plugin allows you to render files in your tiptap editor.

## Usage

```ts
import { FileRendererPlugin } from "@task-manager/tiptap-plugin-file-renderer";

const editor = new Editor({
	extensions: [
		FileRendererPlugin.configure({
			rendererMap: {
				".ts": {
					HTMLAttributes: {
						className: "typescript-file"
					},
					renderer: TypescriptFileRenderer
				},
				"image/*": {
					renderer: ImageRenderer
				}
			}
		})
	]
});
```

By default, the plugin will render the node as a link to the file. You can use one of the default renderers or create your own renderer.
If you use frameworks, you have to wrap your custom renderer in a connector, like `ReactNodeViewRenderer` for React.

### Default renderers

1. `ImageRenderer`
2. `FileRenderer`
3. `VideoRenderer`
4. `AudioRenderer`

### PluginConfig

```ts
{
	rendererMap: Record<
		string,
		{
			HTMLAttributes?: Record<string, any>;
			renderer?: import("@tiptap/core").NodeViewRenderer;
		}
	>;
}
```

