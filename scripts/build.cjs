const fs=require('node:fs'),path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..'),config=ts.readConfigFile(path.join(root,'tsconfig.json'),ts.sys.readFile);if(config.error)throw new Error('Invalid TypeScript configuration');
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,root);
for(const [folder,module] of [['esm',ts.ModuleKind.ES2022],['cjs',ts.ModuleKind.CommonJS]]){const options={...parsed.options,module,outDir:path.join(root,'lib',folder),moduleResolution:ts.ModuleResolutionKind.Node10};const p=ts.createProgram(parsed.fileNames,options),diagnostics=ts.getPreEmitDiagnostics(p);if(diagnostics.length){console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics,{getCanonicalFileName:f=>f,getCurrentDirectory:()=>root,getNewLine:()=> '\n'}));process.exit(1);}const result=p.emit();if(result.emitSkipped)process.exit(1);if(folder==='cjs')fs.writeFileSync(path.join(root,'lib/cjs/package.json'),'\n{"type":"commonjs"}\n');}
console.log('Built ESM + CommonJS with declarations.');
