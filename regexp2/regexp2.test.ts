namespace $ {

	function parse_groups< RE extends $mol_regexp2_strict<any> >( regexp: RE, str: string ) {
		return [ ... str.matchAll( regexp ) ].map( r => ({ ... r.groups }) )
	} 

	$mol_test({

		'escape' () {

			const specials = $mol_regexp2( '.*+?^${}()|[]\\' )
			$mol_assert_equal( specials.source , '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\' )

		},

		'char code' () {

			const space = $mol_regexp2_char_code( 32 )
			$mol_assert_equal( ' '.match( space )![0] , ' ' )

		},

		'repeat fixed'() {

			const year = $mol_regexp2_repeat(
				$mol_regexp2_decimal_only,
				4,
				4,
			)
			
			$mol_assert_equal( '#2020#'.match( year )![0] , '2020' )

		},

		'greedy repeat'() {

			$mol_assert_equal( 'abc'.match( $mol_regexp2_repeat( $mol_regexp2_latin_only ) )![0] , '' )
			$mol_assert_equal( 'abc'.match( $mol_regexp2_repeat_greedy( $mol_regexp2_latin_only ) )![0] , 'abc' )

		},

		'repeat range'() {

			const year = $mol_regexp2_repeat_greedy( $mol_regexp2_decimal_only , 2 , 4 )
			
			$mol_assert_equal( '#2#'.match( year ) , null )
			$mol_assert_equal( '#20#'.match( year )![0] , '20' )
			$mol_assert_equal( '#2020#'.match( year )![0] , '2020' )
			$mol_assert_equal( '#20201#'.match( year )![0] , '2020' )

		},

		'repeat from'() {

			const name = $mol_regexp2_repeat_greedy( $mol_regexp2_latin_only , 2 )

			$mol_assert_equal( '##'.match( name ) , null )
			$mol_assert_equal( '#a#'.match( name ) , null )
			$mol_assert_equal( '#ab#'.match( name )![0], 'ab' )
			$mol_assert_equal( '#abc#'.match( name )![0] , 'abc' )

		},

		'from string'() {

			const regexp = $mol_regexp2( '[\\d]' )
			
			$mol_assert_equal( regexp.source , '\\[\\\\d\\]' )
			$mol_assert_equal( regexp.flags , 'gsu' )

		},

		'from regexp'() {
			
			const regexp = $mol_regexp2( /[\d]/i )
			
			$mol_assert_equal( regexp.source , '[\\d]' )
			$mol_assert_equal( regexp.flags , 'i' )

		},

		'case ignoring'() {

			const xxx = $mol_regexp2( 'x' , { ignoreCase : true } )

			$mol_assert_like( xxx.flags , 'gisu' )
			$mol_assert_like( 'xx'.match( xxx )![0] , 'x' )
			$mol_assert_like( 'XX'.match( xxx )![0] , 'X' )

		},

		'multiline mode'() {

			const xxx = $mol_regexp2( [ 'x' , $mol_regexp2_end ] , { multiline : true } )

			$mol_assert_like( 'x\ny'.match( xxx )![0] , 'x' )
			$mol_assert_like( xxx.flags , 'gmsu' )

		},

		'sequence'() {

			const year = $mol_regexp2_repeat( $mol_regexp2_decimal_only , 4 , 4 )
			const dash = '-'
			const month = $mol_regexp2_repeat( $mol_regexp2_decimal_only , 2 , 2 )
			const day = $mol_regexp2_repeat( $mol_regexp2_decimal_only , 2 , 2 )

			const date = $mol_regexp2( [
				$mol_regexp2_begin,
				year, dash, month, dash, day,
				$mol_regexp2_end
			] , { ignoreCase : true } )

			$mol_assert_like( '2020-01-02'.match( date )![0] , '2020-01-02' )
			$mol_assert_like( date.ignoreCase , true )

		},

		'optional'() {

			const name = $mol_regexp2([ 'A', ['4'] ])

			$mol_assert_equal( 'AB'.match( name )![0] , 'A' )
			$mol_assert_equal( 'A4'.match( name )![0] , 'A4' )

		},

		'only groups'() {

			const regexp = $mol_regexp2({ dog : '@' })

			$mol_assert_like( parse_groups( regexp, '#@' ) , [{ dog : '@' }] )

		},

		'enum variants'() {

			enum Sex {
				male = 'male',
				female = 'female',
			}

			const sexism = $mol_regexp2( Sex )
			
			$mol_assert_like( parse_groups( sexism, '' ), [] )
			
			$mol_assert_like(
				parse_groups( sexism, 'male female' ),
				[
					{ male : 'male' , female : undefined },
					{ male : undefined , female : 'female' },
				]
			)

		},

		'recursive only groups'() {

			enum Sex {
				male = 'male',
				female = 'female',
			}

			const sexism = $mol_regexp2({ Sex })

			$mol_assert_like( parse_groups( sexism, '' ), [] )
			
			$mol_assert_like(
				parse_groups( sexism, 'male female' ),
				[
					{ Sex : 'male' , male : 'male' , female : undefined },
					{ Sex : 'female' , male : undefined , female : 'female' },
				]
			)

		},

		'sequence with groups'() {

			const year = $mol_regexp2_repeat( $mol_regexp2_decimal_only , 4 , 4 )
			const dash = '-'
			const month = $mol_regexp2_repeat( $mol_regexp2_decimal_only , 2 , 2 )
			const day = $mol_regexp2_repeat( $mol_regexp2_decimal_only , 2 , 2 )

			const regexp = $mol_regexp2([
				$mol_regexp2_begin,
				{year}, dash, {month}, dash, {day},
				$mol_regexp2_end,
			])
			
			const found = parse_groups( regexp, '2020-01-02' )

			$mol_assert_like( found , [{
				year : '2020' ,
				month : '01' ,
				day : '02' ,
			}] )

		},

		'recursive sequence with groups'() {

			const year = $mol_regexp2_repeat( $mol_regexp2_decimal_only , 4 , 4 )
			const dash = '-'
			const month = $mol_regexp2_repeat( $mol_regexp2_decimal_only , 2 , 2 )
			const day = $mol_regexp2_repeat( $mol_regexp2_decimal_only , 2 , 2 )

			const regexp = $mol_regexp2([
				$mol_regexp2_begin,
				{ date: [ {year}, dash, {month} ] },
				dash, {day},
				$mol_regexp2_end,
			])
			
			const found = parse_groups( regexp, '2020-01-02' )

			$mol_assert_like( found , [{
				date : '2020-01' ,
				year : '2020' ,
				month : '01' ,
				day : '02' ,
			}] )

		},

		'parse multiple'() {

			const regexp = $mol_regexp2({ $mol_regexp2_decimal_only })

			$mol_assert_like( parse_groups( regexp, '123' ) , [
				{ $mol_regexp2_decimal_only : '1' },
				{ $mol_regexp2_decimal_only : '2' },
				{ $mol_regexp2_decimal_only : '3' },
			] )

		},

		'force after'() {

			const regexp = $mol_regexp2([
				$mol_regexp2_latin_only,
				$mol_regexp2_force_after( '.' ),
			])

			$mol_assert_equal( 'x.'.match( regexp )![0] , 'x' )
			$mol_assert_equal( 'x5'.match( regexp ) , null )

		},

		'forbid after'() {

			const regexp = $mol_regexp2([
				$mol_regexp2_latin_only,
				$mol_regexp2_forbid_after( '.' ),
			])

			$mol_assert_equal( 'x.'.match( regexp ) , null )
			$mol_assert_equal( 'x5'.match( regexp )![0] , 'x' )

		},

		'byte except'() {

			const name = $mol_regexp2_char_except(
				$mol_regexp2_latin_only,
				$mol_regexp2_tab,
			)

			$mol_assert_equal( 'a'.match( name ) , null )
			$mol_assert_equal( '\t'.match( name ) , null )
			$mol_assert_equal( '('.match( name )![0] , '(' )

		},

		'unicode only'() {

			const name = $mol_regexp2([
				$mol_regexp2_unicode_only( 'Script', 'Cyrillic' ),
				$mol_regexp2_unicode_only( 'Hex_Digit' ),
			])

			$mol_assert_equal( 'FF'.match( name ) , null )
			$mol_assert_equal( 'ФG'.match( name ) , null )
			$mol_assert_equal( 'ФF'.match( name )![0] , 'ФF' )

		},
		
		'generate by optional with inner group'() {

			const animals = $mol_regexp2([
				$mol_regexp2_begin,
				'#', [ '^', { dog : '@' } ],
				$mol_regexp2_end,
			])

			$mol_assert_equal( animals.generate({}) , '#' )
			$mol_assert_equal( animals.generate({ dog: false }) , '#' )
			$mol_assert_equal( animals.generate({ dog: true }) , '#^@' )
			$mol_assert_equal( animals.generate({ dog: '$' }) , '#^$' )

		},

	})

}