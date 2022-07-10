const ANONS = {};
let nAnonRules = 0;

const initTokenizer = (tokenizer) => {
	const res = { ...tokenizer, ...ANONS };

	// used for debugging
	/*const deps = new Map();
	
	for(const name in res) {
		const rules = res[name];
		const incs = new Set();

		for(const rule of rules) {
			if(typeof rule === 'object' && 'include' in rule) {
				const inc = rule.include.substr(1);
				if(!(inc in res)) {
					globalThis.console.log("ERROR: rule "+inc+"does not exist!");
				}
				if(inc === name) {
					globalThis.console.log("ERROR: recursive rule "+inc);
				}
				//globalThis.console.log(inc, res[inc]);
				incs.add(inc);
			}
		}

		if(incs.size > 0) {
			deps.set(name, incs);
		}
	}

	for(const [name, incs] of deps.entries()) {
		for(const inc of incs) {
			if(deps.has(inc) && deps.get(inc).has(name)) {
				globalThis.console.log("ERROR: recursive rule "+name+" <-> "+inc);
			}
		}
	}*/

	return res;
};
const _anon = (rules) => {
	let ruleName = "anon_" + nAnonRules;
	nAnonRules++;
	ANONS[ruleName] = rules;
	return "@" + ruleName;
};
const newAnon = (...rules) => _anon(rules);
const anon = (token, ...rules) => ({ token, switchTo: _anon(rules) });
const params = ({ token, switchTo }, ps) => ({ token, switchTo: switchTo + ps });

export const grammar = {
	// defaultToken: 'invalid',

	ShowItem: /mod(?:ule)?|all|desugared|sorts?|ops?|vars?|mbs?|eqs?|r(?:l|ule)s?|strats|sds?|summary|(?:kinds|components)|profile/,

	ShowOption: /advis(?:e|ory|ories)|stats|timing|loop(?:\s+(?:stats|timing))?|breakdown|(?:command|cmd)|gc/,
	PrintOption: /mixfix|flat(?:tened)?|with(?:\s+(?:paren(?:theses|s)?|alias(?:es)?))?|conceal|number|rat|color|format|graph|attr(?:ibute)?(?:\s+newline)?|constants(?:\s+with(?:\s+sorts?)?)?/,
	TraceOption: /cond(?:ition)?|whole|subst(?:itution)?|select|mbs?|eqs?|rls?|sds?|rew(?:rite)?|body/,

	IsAttr: /\s*(?:assoc|comm|left|right|idem|iter|memo|ditto|config|obj|msg|ctor|metadata|strat|poly|frozen|prec|gather|format|special|label|o(?:ther)wise|variant|narrowing)\b/,
	NextIsNotAttr: /(?!@IsAttr)/,
	NextIsTerm: /(?!(?:=>?|:=?|\.)(?:\s|$)|[\s)\]},_]|\[@IsAttr)/,
	NextIsOpForm: /(?!(?:=>?|:=?|\.)(?:\s|$)|[\s)\]},]|\[@IsAttr)/,

	TestVariant: /[xa]?match/,
	MrewVariant: /[xa]?matchrew/,

	ModID: /[a-zA-Z_'][\w\-'<>$]*/,
	ViewID: /[a-zA-Z_'][\w\-'<>$]*/,
	ParameterID: /[a-zA-Z_'][\w\-'<>$]*/,
	SortID: /[a-zA-Z_'][\w\-'<>$]*/,
	VarID: /[a-zA-Z_'][\w\-']*/,
	VarAndSortID: /(@VarID)(:)(@SortID)/,
	OpID: /(?!(?:=>?|:=?|\.)\s)(?:[^\s()\[\]{},`"]|`\S)+/,
	Nat: /\b\d+\b/,
	Token: /(?!(?:=>?|:=?|\.)\s)(?:[^\s()\[\]{},`"]|`\S)+/,
	SpecialToken: /(?:=>?|:=?|\.)(?=\s)|,/,
	LabelID: /[a-zA-Z_][\w\-']*/,
	StratID: /[a-zA-Z_][\w\-']*/,

	tokenizer: initTokenizer({
		root: [
			// whitespace
			{ include: '@whitespace' },

			// toplevel
			{ include: '@SystemCommand' },
			{ include: '@Command' },
			{ include: '@DebuggerCommand' },
			{ include: '@Module' },
			{ include: '@Theory' },
			{ include: '@View' },

			// for the auxiliary predicates editor
			{ include: '@ModElt2' },

			// identifiers
			[/(?:\b|(?!\w))@VarID/, 'identifier'],

			// numbers
			[/(?:\b|-)(?:\d+(?:\/\d+|(?:\.\d+)?(?:[eE]-?\d+(?:\.\d+)?)?)?)\b/, 'number'],

			// delimiters and operators
			[/[{}()\[\]]/, '@brackets'],

			// strings
			[/"/, { token: 'string.quote', bracket: '@open', next: '@StringID' }],
		],

		_pop: [
			['', '', '@pop']
		],

		comment: [
			[/(\*{3})(\()/, ['comment', { token: 'comment', bracket: '@open', next: '@comment_contents' }]],
			[/(-{3})(\()/, ['comment', { token: 'comment', bracket: '@open', next: '@comment_contents' }]],
			[/\*{3}.*$/, 'comment'],
			[/-{3}.*$/, 'comment']
		],
		comment_contents: [
			[/\(/, { token: 'comment', bracket: '@open', next: '@push' }],
			[/\)/, { token: 'comment', bracket: '@open', next: '@pop' }],
			[/./, 'comment']
		],

		whitespace: [
			[/$/, ''],
			[/[ \t\r\n]+/m, 'white'],
			{ include: "@comment" }
		],


		SystemCommand: [
			[/\b(?:quit|eof|popd|pwd)/, 'keyword'],
			[/\b(?:in|s?load|cd|push|ls)\b/, 'keyword', newAnon(
				[/.*$/, 'string', '@pop']
			)]
		],


		Command: [
			[/\bselect\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/@ModID/, anon('type',
					{ include: '@whitespace' },
					[/\./, 'operator', '@pop']
				)]
			)],

			[/\bparse\b/, 'keyword', '@Command_0'],

			[/\b(?:debug\s+)?red(?:uce)?\b/, 'keyword', '@Command_0'],
			[/\b(?:debug\s+)?rew(?:rite)?\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/(\[)(\s*\d+\s*)(\])/, [
					{ token: 'operator', bracket: '@open' },
					'number',
					{ token: 'operator', bracket: '@close', switchTo: '@Command_0' }
				]],
				{ include: '@Command_0' }
			)],
			[/\bdebug\b/, 'keyword'],

			// ...
			[/\bshow\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/\b(?:@ShowItem)\b/, anon('key',
					{ include: '@whitespace' },
					[/@ModID/, anon('type',
						{ include: '@whitespace' },
						[/\./, 'operator', '@pop']
					)],
					[/\./, 'operator', '@pop']
				)],
				[/\bview\b/, anon('key',
					{ include: '@whitespace' },
					[/@ViewID/, anon('type',
						{ include: '@whitespace' },
						[/\./, 'operator', '@pop']
					)],
					[/\./, 'operator', '@pop']
				)],
				[/\b(?:modules|views)\b/, anon('key',
					{ include: '@whitespace' },
					[/\./, 'operator', '@pop']
				)],
				[/\bsearch\b/, anon('key',
					{ include: '@whitespace' },
					[/\bgraph\b/, anon('key',
						{ include: '@whitespace' },
						[/\./, 'operator', '@pop']
					)],
				)],
				[/\bpath\b/, anon('key',
					{ include: '@whitespace' },
					[/\blabels\b/, anon('key',
						{ include: '@whitespace' },
						{ include: '@Command_show_path' }
					)],
					{ include: '@Command_show_path' }
				)],
			)],

			[/\bdo\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/\bclear\b/, anon('key',
					{ include: '@whitespace' },
					[/\bmemo\b/, anon('key',
						{ include: '@whitespace' },
						[/@ModID/, anon('type',
							{ include: '@whitespace' },
							[/\./, 'operator', '@pop']
						)],
						[/\./, 'operator', '@pop']
					)],
				)],
			)],

			[/\bset\b/, 'keyword', '@SetOption']
		],
		Command_0: [
			{ include: '@whitespace' },
			[/\bin\b/, anon('keyword',
				{ include: '@whitespace' },
				[/@ModID/, anon('type',
					{ include: '@whitespace' },
					[/:/, anon('operator',
						{ include: '@whitespace' },
						{ include: '@Command_0_0' }
					)]
				)]
			)],
			{ include: '@Command_0_0' }
		],
		Command_0_0: [
			[/@NextIsTerm/, {
				token: '', switchTo: '@Term.' + newAnon(
					{ include: '@whitespace' },
					[/@NextIsTerm/, '', '@Term.@_pop'],
					[/\./, 'operator', '@pop']
				)
			}]
		],
		Command_show_path: [
			[/\b\d+\b/, anon('key',
				{ include: '@whitespace' },
				[/\./, 'operator', '@pop']
			)],
		],

		SetOption: [
			{ include: '@whitespace' },
			[/\bshow\b/, anon('key',
				{ include: '@whitespace' },
				[/\b(?:@ShowOption)\b/, { token: 'annotation', switchTo: '@OnOff' }]
			)],
			[/\bprint\b/, anon('key',
				{ include: '@whitespace' },
				[/\b(?:@PrintOption)\b/, { token: 'annotation', switchTo: '@OnOff' }]
			)],
			[/\btrace\b/, anon('key',
				{ include: '@whitespace' },
				[/\b(?:@TraceOption)\b/, { token: 'annotation', switchTo: '@OnOff' }],
				['', { token: '', switchTo: '@OnOff' }]
			)],
			[/\b(?:break|verbose|profile)\b/, { token: 'key', switchTo: '@OnOff' }],
			[/\bclear\b/, anon('key',
				{ include: '@whitespace' },
				[/\b(?:memo|rules|profile)\b/, { token: 'annotation', switchTo: '@OnOff' }]
			)],
			[/\b(?:protect|extend|include)\b/, anon('key',
				{ include: '@whitespace' },
				[/@ModID/, { token: 'type', switchTo: '@OnOff' }]
			)]
		],

		OnOff: [
			{ include: '@whitespace' },
			[/\b(?:on|off)\b/, anon('keyword',
				{ include: '@whitespace' },
				[/\./, 'operator', '@pop']
			)]
		],




		DebuggerCommand: [
			[/\b(?:resume|abort|step|where)\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/\./, 'operator', '@pop']
			)]
		],


		Module: [
			[/\bfmod\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/@ModID/, anon('type',
					{ include: '@whitespace' },
					{ include: '@ParameterList' },
					[/\bis\b/, { token: 'keyword', switchTo: '@ModElt.endfm' }]
				)]
			)],
			[/\bmod\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/@ModID/, anon('type',
					{ include: '@whitespace' },
					{ include: '@ParameterList' },
					[/\bis\b/, { token: 'keyword', switchTo: '@ModElt2.endm' }]
				)]
			)],
			[/\bsmod\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/@ModID/, anon('type',
					{ include: '@whitespace' },
					{ include: '@ParameterList' },
					[/\bis\b/, { token: 'keyword', switchTo: '@SmodElt.endsm' }]
				)]
			)]
		],


		Theory: [
			[/\bfth\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/@ModID/, anon('type',
					{ include: '@whitespace' },
					[/\bis\b/, { token: 'keyword', switchTo: '@ModElt.endfth' }]
				)]
			)],
			[/\bmod\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/@ModID/, anon('type',
					{ include: '@whitespace' },
					[/\bis\b/, { token: 'keyword', switchTo: '@ModElt2.endth' }]
				)]
			)],
			[/\bsmod\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/@ModID/, anon('type',
					{ include: '@whitespace' },
					[/\bis\b/, { token: 'keyword', switchTo: '@SmodElt.endsth' }]
				)]
			)]
		],


		View: [
			[/\bview\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/@ViewID/, anon('type',
					{ include: '@ParameterList' },
					[/\bfrom\b/, anon('keyword',
						{ include: '@whitespace' },
						[/\bto\b/, anon('keyword',
							{ include: '@whitespace' },
							[/\bis\b/, { token: 'keyword', switchTo: '@ViewElt' }],
							{ include: '@ModExp' },
						)],
						{ include: '@ModExp' },
					)]
				)]
			)]
		],


		ParameterList: [
			{ include: '@whitespace' },
			[/\{/, { token: '', bracket: '@open', next: '@ParameterList_0' }]
		],
		ParameterList_0: [
			{ include: '@whitespace' },
			[/@ParameterID/, anon('type',
				{ include: '@whitespace' },
				[/::/, anon('operator',
					{ include: '@whitespace' },
					{ include: '@ModExp' },
					[/(?=[},])/, anon('',
						{ include: '@whitespace' },
						[/,/, 'operator', newAnon(
							{ include: '@whitespace' },
							[/@ParameterID/, anon('type',
								{ include: '@whitespace' },
								[/::/, anon('operator',
									{ include: '@whitespace' },
									{ include: '@ModExp' },
									[/(?=[},])/, '', '@pop']
								)]
							)]
						)],
						[/\}/, { token: '', bracket: '@close', next: '@pop' }]
					)],
				)]
			)]
		],


		ModExp: [
			[/@ModID/, 'type'],
			[/\(/, { token: 'operator', bracket: '@open', next: '@push' }],
			[/\)/, { token: 'operator', bracket: '@close', next: '@pop' }],
			[/\+/, 'operator'],
			[/\*/, 'operator', '@Renaming'],
			[/\{/, {
				token: 'operator', bracket: '@open', next: newAnon(
					{ include: '@whitespace' },
					[/@ViewID/, 'type'],
					[/,/, 'operator'],
					[/\}/, { token: 'operator', bracket: '@close', next: '@pop' }]
				)
			}]
		],
		Renaming: [
			{ include: '@whitespace' },
			[/\(/, { token: 'operator', bracket: '@open', switchTo: '@Renaming_0' }]
		],
		Renaming_0: [
			{ include: '@whitespace' },
			[/\)/, { token: 'operator', bracket: '@open', next: '@pop' }],
			[/,/, 'operator'],
			{ include: '@RenamingItem' }
		],
		RenamingItem: [
			[/\bsort\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/\bto\b/, anon('keyword',
					{ include: '@whitespace' },
					{ include: '@Sort' },
					['', '', '@pop']
				)],
				{ include: '@Sort' },
			)],
			[/\blabel\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/\b@LabelID/, anon('annotation',
					{ include: '@whitespace' },
					[/\bto\b/, anon('keyword',
						{ include: '@whitespace' },
						[/\b@LabelID/, 'annotation', '@pop']
					)]
				)]
			)],
			[/\bop\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/@NextIsOpForm/, {
					token: '', switchTo: '@OpForm.' + newAnon(
						{ include: '@whitespace' },
						{ include: '@ToPartRenamingItem' },
						[/:/, anon('operator',
							{ include: '@whitespace' },
							[/[-~]>/, anon('operator',
								{ include: '@whitespace' },
								{ include: '@ToPartRenamingItem' },
								{ include: '@Type' }
							)],
							{ include: '@Type' }
						)]
					)
				}]
			)],
			[/\bstrat\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/\b@StratID/, anon('annotation',
					{ include: '@whitespace' },
					[/\bto\b/, anon('keyword',
						{ include: '@whitespace' },
						[/\b@StratID/, 'annotation', '@pop']
					)],
					[/:/, anon('operator',
						{ include: '@whitespace' },
						{ include: '@Type' },
						{ include: '@RenamingItem_strat' }
					)],
					{ include: '@RenamingItem_strat' }
				)]
			)]
		],
		RenamingItem_strat: [
			[/\@/, anon('operator',
				{ include: '@whitespace' },
				[/\bto\b/, anon('keyword',
					{ include: '@whitespace' },
					[/\b@StratID/, 'annotation', '@pop']
				)],
				{ include: '@Type' }
			)]
		],
		ToPartRenamingItem: [
			[/\bto\b/, anon('keyword',
				{ include: '@whitespace' },
				[/@NextIsOpForm/, {
					token: '', switchTo: '@OpForm.' + newAnon(
						{ include: '@whitespace' },
						[/\[/, {
							bracket: '@open', ...anon('operator',
								{ include: '@whitespace' },
								{ include: '@Attr' },
								[/\]/, { token: 'operator', bracket: '@close', next: '@pop' }]
							)
						}],
						['', '', '@pop']
					)
				}]
			)]
		],


		Type: [
			{ include: '@Sort' },
			{ include: '@Kind' }
		],


		Kind: [
			[/\[/, {
				bracket: '@open', ...anon('operator',
					{ include: '@whitespace' },
					{ include: '@Sort' },
					[/,/, 'operator'],
					[/\]/, { token: 'operator', bracket: '@close', next: '@pop' }]
				)
			}]
		],


		Sort: [
			[/(@SortID)(\{)/, [
				'type',
				{ token: 'operator', bracket: '@open', next: '@Sort_0' }
			]],
			[/@SortID/, 'type']
		],
		Sort_0: [
			{ include: '@whitespace' },
			[/(\})(\{)/, [
				{ token: 'operator', bracket: '@close' },
				{ token: 'operator', bracket: '@open' }
			]],
			[/\}/, { token: 'operator', bracket: '@close', next: '@pop' }],
			[/,/, 'operator'],
			{ include: '@Sort' }
		],


		ModElt: [
			{ include: '@whitespace' },
			[/\b(?:inc(?:luding)?|ex(?:tending)?|pr(?:otecting)?)\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				{ include: '@ModExp' },
				[/\./, 'operator', '@pop']
			)],
			[/\bsorts?\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				{ include: '@Sort' },
				[/\./, 'operator', '@pop']
			)],
			[/\bsubsorts?\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				{ include: '@Sort' },
				[/</, 'operator', newAnon(
					{ include: '@whitespace' },
					{ include: '@Sort' },
					[/(?=[<.])/, '', '@pop']
				)],
				[/\./, 'operator', '@pop']
			)],
			[/\bop\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/@NextIsOpForm/, {
					token: '', switchTo: '@OpForm.' + newAnon(
						{ include: '@whitespace' },
						[/@NextIsOpForm/, '', '@OpForm.@_pop'],
						[/:/, anon('operator',
							{ include: '@whitespace' },
							[/[-~]>/, anon('operator',
								{ include: '@whitespace' },
								{ include: '@Attrs' },
								{ include: '@Type' },
								[/\./, 'operator', '@pop']
							)],
							{ include: '@Type' }
						)]
					)
				}]
			)],
			[/\bops\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/@OpID/, 'keyword.flow'],
				[/\(/, {
					token: 'operator', bracket: '@open', next: newAnon(
						[/@NextIsOpForm/, { token: '', switchTo: '@OpForm.@_pop' }],
						[/\)/, { token: '', bracket: '@close', next: '@pop' }]
					)
				}],
				[/:/, anon('operator',
					{ include: '@whitespace' },
					[/[-~]>/, anon('operator',
						{ include: '@whitespace' },
						{ include: '@Attrs' },
						{ include: '@Type' },
						[/\./, 'operator', '@pop']
					)],
					{ include: '@Type' }
				)]
			)],
			[/\bvars?\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/:/, anon('operator',
					{ include: '@whitespace' },
					{ include: '@Type' },
					[/\./, 'operator', '@pop']
				)],
				[/@VarID/, 'variable']
			)],
			[/\b(?:end[fs]?(?:m|th))\b/, {
				cases: {
					'==$S2': { token: 'keyword', next: '@pop' },
					'@default': 'invalid'
				}
			}],
			[/(?=(?:c?mb|eq|ce?q)\b)/, '', '@Statement.' + newAnon(
				{ include: '@whitespace' },
				{ include: '@StatementAttrs' },
				[/\./, 'operator', '@pop']
			)]
		],


		ViewElt: [
			{ include: '@whitespace' },
			[/\bvar\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/:/, anon('operator',
					{ include: '@whitespace' },
					{ include: '@Type' },
					[/\./, 'operator', '@pop']
				)],
				[/@VarID/, 'variable']
			)],

			[/\bsort\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/\bto\b/, anon('keyword',
					{ include: '@whitespace' },
					{ include: '@Sort' },
					[/\./, 'operator', '@pop']
				)],
				{ include: '@Sort' },
			)],

			[/\blabel\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/\b@LabelID/, anon('annotation',
					{ include: '@whitespace' },
					[/\bto\b/, anon('keyword',
						{ include: '@whitespace' },
						[/\b@LabelID/, anon('annotation',
							{ include: '@whitespace' },
							[/\./, 'operator', '@pop']
						)]
					)]
				)]
			)],

			[/\bop\b(?=\s+.+?\bto\s+term(?:\s+|$))/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/@NextIsTerm/, {
					token: '', switchTo: '@Term.' + newAnon(
						{ include: '@whitespace' },
						[/\bto\b/, anon('keyword',
							{ include: '@whitespace' },
							[/\bterm\b/, anon('keyword',
								{ include: '@whitespace' },
								[/@NextIsTerm/, {
									token: '', switchTo: '@Term.' + newAnon(
										{ include: '@whitespace' },
										[/@NextIsTerm/, '', '@Term.@_pop'],
										[/\./, 'operator', '@pop']
									)
								}]
							)]
						)]
					)
				}]
			)],
			[/\bop\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/@NextIsOpForm/, {
					token: '', switchTo: '@OpForm.' + newAnon(
						{ include: '@whitespace' },
						{ include: '@ViewElt_to_OpForm' },
						[/:/, anon('operator',
							{ include: '@whitespace' },
							[/[-~]>/, anon('operator',
								{ include: '@whitespace' },
								{ include: '@ViewElt_to_OpForm' },
								{ include: '@Type' }
							)],
							{ include: '@Type' }
						)],
						[/@NextIsOpForm/, '', '@OpForm.@_pop']
					)
				}]
			)],

			[/\bstrat\b(?=\s+@StratID\()/, 'keyword', newAnon(
				{ include: '@whitespace' },
				['', {
					token: '', switchTo: '@StratCall.' + newAnon(
						{ include: '@whitespace' },
						[/\bto\b/, anon('keyword',
							{ include: '@whitespace' },
							[/\bexpr\b/, anon('keyword',
								{ include: '@whitespace' },
								['', {
									token: '', switchTo: '@Strat.' + newAnon(
										{ include: '@whitespace' },
										[/\./, 'operator', '@pop']
									)
								}]
							)]
						)]
					)
				}]
			)],
			[/\bstrat\b/, 'keyword', newAnon(
				{ include: '@whitespace' },
				[/\b@StratID/, anon('annotation',
					{ include: '@whitespace' },
					{ include: '@ViewElt_to_StratID' },
					[/:/, anon('operator',
						{ include: '@whitespace' },
						{ include: '@Type' },
						{ include: '@ViewElt_strat' }
					)],
					{ include: '@ViewElt_strat' }
				)]
			)],

			[/\bendv\b/, 'keyword', '@pop']
		],
		ViewElt_to_OpForm: [
			[/\bto\b/, anon('keyword',
				{ include: '@whitespace' },
				[/@NextIsOpForm/, {
					token: '', switchTo: '@OpForm.' + newAnon(
						{ include: '@whitespace' },
						[/\./, 'operator', '@pop']
					)
				}]
			)]
		],
		ViewElt_strat: [
			[/\@/, anon('operator',
				{ include: '@whitespace' },
				{ include: '@ViewElt_to_StratID' },
				{ include: '@Type' }
			)]
		],
		ViewElt_to_StratID: [
			[/\bto\b/, anon('keyword',
				{ include: '@whitespace' },
				[/\b@StratID/, 'annotation', '@pop']
			)]
		],


		ModElt2: [
			{ include: '@ModElt' },
			[/(?=c?rl\b)/, '', '@Statement2.' + newAnon(
				{ include: '@whitespace' },
				{ include: '@StatementAttrs' },
				[/\./, 'operator', '@pop']
			)]
		],


		SmodElt: [
			{ include: '@ModElt2' },
			[/\bstrat\b/, 'keyword'],
			[/\bsd\b/, 'keyword'],
			[/[A-Z_][\w'-]*/, 'variable.name'],
			// TODO
			[/\b(?:end[fs]?(?:m|th))\b/, {
				cases: {
					'==$S2': { token: 'keyword', next: '@pop' },
					'@default': 'invalid'
				}
			}]
		],


		Statement: [
			{ include: '@whitespace' },
			[/(?=[\[.])/, { token: '', switchTo: '$S2' }],
			[/\bmb\b/, params(anon('keyword',
				{ include: '@whitespace' },
				[/(\[@LabelID\])?(\s+:)/, [
					'annotation',
					{ token: 'operator', switchTo: '@Statement_mb.$S2' }
				]],
				['', { token: '', switchTo: '@Statement_mb.$S2' }]
			), '.$S2')],
			[/\bcmb\b/, params(anon('keyword',
				{ include: '@whitespace' },
				[/(\[@LabelID\])?(\s+:)/, [
					'annotation',
					{ token: 'operator', switchTo: '@Statement_cmb.$S2' }
				]],
				['', { token: '', switchTo: '@Statement_cmb.$S2' }]
			), '.$S2')],
			[/\beq\b/, params(anon('keyword',
				{ include: '@whitespace' },
				[/(\[@LabelID\])?(\s+:)/, [
					'annotation',
					{ token: 'operator', switchTo: '@Statement_eq.$S2' }
				]],
				['', { token: '', switchTo: '@Statement_eq.$S2' }]
			), ".$S2")],
			[/\bce?q\b/, params(anon('keyword',
				{ include: '@whitespace' },
				[/(\[@LabelID\])?(\s+:)/, [
					'annotation',
					{ token: 'operator', switchTo: '@Statement_ceq.$S2' }
				]],
				['', { token: '', switchTo: '@Statement_ceq.$S2' }]
			), '.$S2')],
		],
		Statement_mb: [
			{ include: '@whitespace' },
			[/@NextIsTerm/, {
				token: '', switchTo: '@Term.' + newAnon(
					[/:/, params(anon('operator',
						{ include: '@whitespace' },
						[/(?=[\[.])/, { token: '', switchTo: '$S2' }],
						{ include: '@Sort' }
					), '.$S2')]
				) + '.$S2'
			}]
		],
		Statement_cmb: [
			{ include: '@whitespace' },
			[/@NextIsTerm/, {
				token: '', switchTo: '@Term.' + newAnon(
					[/:/, params(anon('operator',
						{ include: '@whitespace' },
						[/\bif\b/, params(anon('keyword',
							{ include: '@whitespace' },
							[/(?=[\[.])/, { token: '', switchTo: '$S2' }],
							{ include: '@Condition' }
						), '.$S2')],
						{ include: '@Sort' }
					), '.$S2')]
				) + '.$S2'
			}]
		],
		Statement_eq: [
			{ include: '@whitespace' },
			[/@NextIsTerm/, {
				token: '', switchTo: '@Term.' + newAnon(
					[/@NextIsTerm/, '', '@Term.@_pop'],
					[/=/, params(anon('operator',
						{ include: '@whitespace' },
						[/@NextIsTerm/, {
							token: '', switchTo: '@Term.' + newAnon(
								{ include: '@whitespace' },
								[/@NextIsTerm/, '', '@Term.@_pop'],
								[/(?=[\[.])/, { token: '', switchTo: '$S2' }]
							) + '.$S2'
						}]
					), '.$S2')]
				) + '.$S2'
			}]
		],
		Statement_ceq: [
			{ include: '@whitespace' },
			[/@NextIsTerm/, {
				token: '', switchTo: '@Term.' + newAnon(
					[/@NextIsTerm/, '', '@Term.@_pop'],
					[/=/, params(anon('operator',
						{ include: '@whitespace' },
						[/@NextIsTerm/, {
							token: '', switchTo: '@Term.' + newAnon(
								{ include: '@whitespace' },
								[/\bif\b/, params(anon('keyword',
									{ include: '@whitespace' },
									[/(?=[\[.])/, { token: '', switchTo: '$S2' }],
									{ include: '@Condition' }
								), '.$S2')],
								[/@NextIsTerm/, '', '@Term.@_pop'],
							) + '.$S2'
						}]
					), '.$S2')]
				) + '.$S2'
			}]
		],


		Statement2: [
			[/\brl\b/, params(anon('keyword',
				{ include: '@whitespace' },
				[/(\[@LabelID\])?(\s+:)/, [
					'annotation',
					{ token: 'operator', switchTo: '@Statement2_rl.$S2' }
				]],
				['', { token: '', switchTo: '@Statement2_rl.$S2' }]
			), '.$S2')],
			[/\bcrl\b/, params(anon('keyword',
				{ include: '@whitespace' },
				[/(\[@LabelID\])?(\s*:)/, [
					'annotation',
					{ token: 'operator', switchTo: '@Statement2_crl.$S2' }
				]],
				['', { token: '', switchTo: '@Statement2_crl.$S2' }]
			), '.$S2')],
		],
		Statement2_rl: [
			{ include: '@whitespace' },
			[/@NextIsTerm/, {
				token: '', switchTo: '@Term.' + newAnon(
					{ include: '@whitespace' },
					[/@NextIsTerm/, '', '@Term.@_pop'],
					[/=>/, params(anon('operator',
						{ include: '@whitespace' },
						[/@NextIsTerm/, {
							token: '', switchTo: '@Term.' + newAnon(
								{ include: '@whitespace' },
								[/@NextIsTerm/, '', '@Term.@_pop'],
								[/(?=[\[.])/, { token: '', switchTo: '$S2' }]
							) + '.$S2'
						}]
					), '.$S2')]
				) + '.$S2'
			}]
		],
		Statement2_crl: [
			{ include: '@whitespace' },
			[/@NextIsTerm/, {
				token: '', switchTo: '@Term.' + newAnon(
					{ include: '@whitespace' },
					[/@NextIsTerm/, '', '@Term.@_pop'],
					[/=>/, params(anon('operator',
						{ include: '@whitespace' },
						[/@NextIsTerm/, {
							token: '', switchTo: '@Term.' + newAnon(
								{ include: '@whitespace' },
								[/\bif\b/, params(anon('keyword',
									{ include: '@whitespace' },
									[/(?=[\[.])/, { token: '', switchTo: '$S2' }],
									{ include: '@Condition2' }
								), '.$S2')],
								[/@NextIsTerm/, '', '@Term.@_pop'],
							) + '.$S2'
						}]
					), '.$S2')]
				) + '.$S2'
			}]
		],


		StratStatement: [

		],


		Condition: [

		],


		Condition2: [

		],


		Attr: [
			[/\b(?:assoc|comm|idem|iter|memo|ditto|config|obj|msg|ctor)\b/, 'annotation'],
			[/\b((?:(?:left|right)\s+)?id)(:)/, [
				'annotation',
				{
					token: 'operator', next: newAnon(
						{ include: '@whitespace' },
						[/@NextIsTerm/, { token: '', switchTo: '@Term.@_pop' }]
					)
				}
			]],
			[/\b(?:left|right)\b/, 'annotation'],

			[/\bmetadata\b/, 'annotation', newAnon(
				{ include: '@whitespace' },
				[/"/, { token: 'string.quote', bracket: '@open', switchTo: '@StringID' }],
			)],
			[/\b(?:strat|poly|frozen(?=\s+\d))\b/, 'annotation', newAnon(
				{ include: '@whitespace' },
				[/\b\d+\b/, 'number'],
				['', '', '@pop']
			)],
			[/\bfrozen\b/, 'annotation'],
			[/\bprec\b/, 'annotation', newAnon(
				{ include: '@whitespace' },
				[/\b\d+\b/, 'number', '@pop'],
			)],
			[/\bgather\b/, 'annotation', newAnon(
				{ include: '@whitespace' },
				[/\(/, {
					token: 'operator', bracket: '@open', switchTo: newAnon(
						{ include: '@whitespace' },
						[/\b[eE]\b|&/, 'key'],
						[/\)/, { token: 'operator', bracket: '@close', next: '@pop' }]
					)
				}]
			)],
			[/\bformat\b/, 'annotation', newAnon(
				{ include: '@whitespace' },
				[/\(/, {
					token: 'operator', bracket: '@open', switchTo: newAnon(
						{ include: '@whitespace' },
						[/\)/, { token: 'operator', bracket: '@close', next: '@pop' }],
						[/@NextIsTerm/, '', '@Term.@_pop']
					)
				}]
			)],
			[/\bspecial\b/, 'annotation', newAnon(
				{ include: '@whitespace' },
				[/\(/, {
					token: 'operator', bracket: '@open', switchTo: newAnon(
						{ include: '@whitespace' },
						[/\)/, { token: 'operator', bracket: '@close', next: '@pop' }],
						{ include: '@Hook' }
					)
				}]
			)],
			// ...
		],

		Hook: [
			[/\b(id-hook)(\()/, [
				'key',
				{
					token: 'operator', bracket: '@open', next: newAnon(
						{ include: '@whitespace' },
						[/@Token/, anon('variable',
							{ include: '@whitespace' },
							[/,/, { token: 'operator', switchTo: '@Hook_0' }]
						)]
					)
				}
			]],
			[/\bid-hook\b/, 'key', newAnon(
				{ include: '@whitespace' },
				{ include: '@Hook_1' }
			)],

			[/\b((?:op|term)-hook)(\()/, [
				'key',
				{
					token: 'operator', bracket: '@open', next: newAnon(
						{ include: '@whitespace' },
						[/@Token/, anon('variable',
							{ include: '@whitespace' },
							[/,/, { token: 'operator', switchTo: '@Hook_2' }]
						)]
					)
				}
			]],
			[/\b(?:op|term)-hook\b/, 'key', newAnon(
				{ include: '@whitespace' },
				{ include: '@Hook_3' }
			)],

			['', '', '@Hook_3']
		],
		Hook_0: [
			{ include: '@whitespace' },
			[/@NextIsTerm/, {
				token: '', switchTo: '@TokenString.' + newAnon(
					{ include: '@whitespace' },
					[/\)/, { token: 'operator', bracket: '@close', next: '@pop' }],
				)
			}]
		],
		Hook_1: [
			[/@Token/, anon('variable',
				{ include: '@whitespace' },
				[/\(/, { token: 'operator', bracket: '@open', switchTo: '@Hook_0' }],
				['', '', '@pop']
			)]
		],
		Hook_2: [
			{ include: '@whitespace' },
			[/\)/, { token: 'operator', bracket: '@close', next: '@pop' }],
			[/,/, 'operator'],
			[/@SpecialToken/, 'keyword.operator'],
			[/@NextIsTerm/, '', '@TokenString.@_pop']
		],
		Hook_3: [
			[/@Token/, anon('variable',
				{ include: '@whitespace' },
				[/\(/, { token: 'operator', bracket: '@open', switchTo: '@Hook_2' }],
			)]
		],

		Attrs: [
			[/\[/, {
				token: 'operator', bracket: '@open', next: newAnon(
					{ include: '@whitespace' },
					{ include: '@Attr' },
					[/\]/, { token: 'operator', bracket: '@close', next: '@pop' }]
				)
			}]
		],


		StatementAttr: [

			// Eq
			[/\b(?:o(?:ther)?wise|variant)\b/, 'annotation'],

			// Rl
			[/\bnarrowing\b/, 'annotation']
		],

		StatementAttrs: [
			[/\[/, {
				token: 'operator', bracket: '@open', next: newAnon(
					{ include: '@whitespace' },
					{ include: '@StatementAttr' },
					[/\]/, { token: 'operator', bracket: '@close', next: '@pop' }]
				)
			}]
		],


		Strat: [
			[/\b(?:idle|fail)\b/, { token: 'keyword', switchTo: '$S2' }],
			// ...
			[/(?=\b@StratID\()/, { token: '', switchTo: '@StratCall.$S2' }]
		],


		StratCall: [
			[/\b(@StratID)(\()(\))/, [
				'annotation',
				{ token: 'operator', bracket: '@open' },
				{ token: 'operator', bracket: '@close', switchTo: '$S2' }
			]],
			[/\b(@StratID)(\()/, [
				'annotation',
				{ token: 'operator', bracket: '@open', switchTo: '@StratCall_args.$S2' }
			]]
		],
		StratCall_args: [
			{ include: '@whitespace' },
			[/@NextIsTerm/, {
				token: '', switchTo: '@Term.' + newAnon(
					{ include: '@whitespace' },
					[/,/, 'operator', newAnon(
						{ include: '@whitespace' },
						[/@NextIsTerm/, { token: '', switchTo: '@Term.@_pop' }]
					)],
					[/\)/, { token: 'operator', bracket: '@close', switchTo: '$S2' }]
				) + '.$S2'
			}]
		],


		StringID: [
			[/[^\\"]+/, 'string'],
			[/\\\d{3}/, 'metatag'],
			[/\\./, 'metatag'],
			[/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
		],

		OpForm: [
			[/\(/, {
				token: '', bracket: '@open', next: newAnon(
					{ include: '@whitespace' },
					[/\)/, { token: 'operator', bracket: '@close', next: '@pop' }],
					[/,/, 'keyword.operator'],
					[/@SpecialToken/, 'keyword.operator'],
					[/@NextIsOpForm/, '', '@OpForm.@_pop']
				)
			}],
			[/\[@NextIsNotAttr/, {
				token: '', bracket: '@open', next: newAnon(
					{ include: '@whitespace' },
					[/\]/, { token: 'operator', bracket: '@close', next: '@pop' }],
					[/,/, 'keyword.operator'],
					[/@SpecialToken/, 'keyword.operator'],
					[/@NextIsOpForm/, '', '@OpForm.@_pop']
				)
			}],
			[/\{/, {
				token: '', bracket: '@open', next: newAnon(
					{ include: '@whitespace' },
					[/\}/, { token: 'operator', bracket: '@close', next: '@pop' }],
					[/,/, 'keyword.operator'],
					[/@SpecialToken/, 'keyword.operator'],
					[/@NextIsOpForm/, '', '@OpForm.@_pop']
				)
			}],
			[/"/, { token: 'string.quote', bracket: '@open', next: '@StringID' }],
			[/@OpID/, 'keyword.flow'],
			['', { token: '', switchTo: '$S2' }]
		],

		// TODO: figure out how to parse infix terms
		Term: [
			{ include: '@Term_0' },
			['', { token: '', switchTo: '$S2.$S3' }]
		],
		Term_0: [
			[/\(/, {
				token: 'operator', bracket: '@open', next: newAnon(
					{ include: '@whitespace' },
					[/\)/, { token: 'operator', bracket: '@close', next: '@pop' }],
					[/,/, 'operator'],
					[/@SpecialToken/, 'keyword.operator'],
					[/@NextIsTerm/, '', '@Term.@_pop']
				)
			}],
			[/\[@NextIsNotAttr/, {
				token: 'operator', bracket: '@open', next: newAnon(
					{ include: '@whitespace' },
					[/\]/, { token: 'operator', bracket: '@close', next: '@pop' }],
					[/,/, 'operator'],
					[/@SpecialToken/, 'keyword.operator'],
					[/@NextIsTerm/, '', '@Term.@_pop']
				)
			}],
			[/\{/, {
				token: 'operator', bracket: '@open', next: newAnon(
					{ include: '@whitespace' },
					[/\}/, { token: 'operator', bracket: '@close', next: '@pop' }],
					[/,/, 'operator'],
					[/@SpecialToken/, 'keyword.operator'],
					[/@NextIsTerm/, '', '@Term.@_pop']
				)
			}],
			[/"/, { token: 'string.quote', bracket: '@open', next: '@StringID' }],
			[/@Token/, {
				cases: {
					'~^-?\\d+$': 'number',
					'@default': 'variable'
				}
			}],
		],

		TokenString: [
			{ include: '@TokenString_0' },
			['', { token: '', switchTo: '$S2.$S3' }]
		],
		TokenString_0: [
			[/\(/, {
				token: 'operator', bracket: '@open', next: newAnon(
					{ include: '@whitespace' },
					[/\)/, { token: 'operator', bracket: '@close', next: '@pop' }],
					[/,/, 'operator'],
					[/@SpecialToken/, 'keyword.operator'],
					[/@NextIsTerm/, '', '@TokenString.@_pop']
				)
			}],
			[/\[@NextIsNotAttr/, {
				token: 'operator', bracket: '@open', next: newAnon(
					{ include: '@whitespace' },
					[/\]/, { token: 'operator', bracket: '@close', next: '@pop' }],
					[/,/, 'operator'],
					[/@SpecialToken/, 'keyword.operator'],
					[/@NextIsTerm/, '', '@TokenString.@_pop']
				)
			}],
			[/\{/, {
				token: 'operator', bracket: '@open', next: newAnon(
					{ include: '@whitespace' },
					[/\}/, { token: 'operator', bracket: '@close', next: '@pop' }],
					[/,/, 'operator'],
					[/@SpecialToken/, 'keyword.operator'],
					[/@NextIsTerm/, '', '@TokenString.@_pop']
				)
			}],
			[/"/, { token: 'string.quote', bracket: '@open', next: '@StringID' }],
			[/@Token/, 'string'],
		],
	})
};