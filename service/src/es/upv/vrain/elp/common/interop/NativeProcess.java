package es.upv.vrain.elp.common.interop;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.util.Scanner;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class NativeProcess {
	ProcessBuilder builder;
	StringBuilder outBuffer = new StringBuilder();
	StringBuilder errBuffer = new StringBuilder();
	
	public NativeProcess(String... command) {
		assert (command != null);
		assert (command.length > 0);
		
		builder = new ProcessBuilder().command(command);
	}
	
	public NativeProcessResult startAndWait(String input, long timeout, TimeUnit timeoutUnit) throws IOException, InterruptedException, TimeoutException {
		Process process = builder.start();
		
		Thread outThread = inheritIO(process.getInputStream(), outBuffer);
		Thread errThread = inheritIO(process.getErrorStream(), errBuffer);
		
		OutputStream stdinStream = process.getOutputStream();
		BufferedWriter stdin = new BufferedWriter(new OutputStreamWriter(stdinStream));
		
		stdin.write(input);
		stdin.flush();
		stdin.close();
		
		outThread.join();
		errThread.join();
		
		final boolean completed = process.waitFor(timeout, timeoutUnit);
		if (!completed) {
			throw new TimeoutException();
		}
		
		return new NativeProcessResult(outBuffer.toString(), errBuffer.toString());
	}
	
	private static Thread inheritIO(final InputStream stream, final StringBuilder buffer) {
		Thread thread = new Thread(new Runnable() {
			public void run() {
				Scanner scanner = new Scanner(stream);
				while (scanner.hasNextLine()) {
					buffer.append(scanner.nextLine() + "\n");
				}
				scanner.close();
			}
		});
		thread.start();
		return thread;
	}
}
