namespace $.$$ {
	export class $mol_pop extends $.$mol_pop {
		
		@ $mol_mem
		showed( next = false ) {
			this.focused()
			return next
		}

		@ $mol_mem
		sub_visible() {
			return [
				this.Anchor() ,
				... this.showed() ? [ this.Bubble() ] : [] ,
			]
		}
		
		@ $mol_mem
		height_max() {
			
			const viewport = this.$.$mol_window.size()
			const rect_bubble = this.view_rect()!
			const align = this.align_vert()
			
			if( align === 'bottom' ) return ( viewport.height - rect_bubble.bottom ) * .66
			if( align === 'top' ) return rect_bubble.top * .66
			
			return 0
		}

		@ $mol_mem
		align() {
			return `${ this.align_vert() }_${ this.align_hor() }`
		}

		@ $mol_mem
		align_vert() {
			const viewport = this.view_port()
			
			const rect_bubble = this.view_rect()
			if( !rect_bubble ) return 'suspense'
			
			return rect_bubble.top > ( viewport.top + viewport.height - rect_bubble.bottom ) ? 'top' : 'bottom'
		}

		@ $mol_mem
		align_hor() {
			const viewport = this.view_port()
			
			const rect_bubble = this.view_rect()
			if( !rect_bubble ) return 'suspense'
			
			return rect_bubble.left > ( viewport.left + viewport.width - rect_bubble.right ) ? 'left' : 'right'
		}
		
		@ $mol_mem
		View_port() {
			const view = new $mol_view
			view.dom_node( ( this.dom_node() as HTMLElement ).offsetParent! )
			return view
		}
		
		@ $mol_mem
		view_port() {
			return this.View_port().view_rect() ?? { ... this.$.$mol_window.size(), left: 0, top: 0 }
		}

	}
}
