namespace $.$$ {
	
	export class $mol_page extends $.$mol_page {
		
		body_scroll_top( next? : number ) {
			return $mol_state_session.value( `${ this }.body_scroll_top()` , next ) || 0
		}

		style() {
			return {
				... super.style() ,
				minWidth: 0 ,
			}
		}
		
	}
	
}
