import java.io.BufferedReader;
import java.io.FileReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Locale;

public class CreateSchema {
    public static void main(String[] args) throws ClassNotFoundException {
        String host, port, databaseName, userName, password, schemaFilePath;
        host = port = databaseName = userName = password = schemaFilePath = null;

        for (int i = 0; i < args.length - 1; i++) {
            switch (args[i].toLowerCase(Locale.ROOT)) {
                case "-host":
                    host = args[++i];
                    break;
                case "-username":
                    userName = args[++i];
                    break;
                case "-password":
                    password = args[++i];
                    break;
                case "-database":
                    databaseName = args[++i];
                    break;
                case "-port":
                    port = args[++i];
                    break;
                case "-schema":
                    schemaFilePath = args[++i];
                    break;
            }
        }

        if (host == null || port == null || databaseName == null || schemaFilePath == null) {
            System.out.println(
                    "Usage: java CreateSchema -host <host> -port <port> -database <database> -username <username> -password <password> -schema <schemaFilePath>");
            return;
        }

        Class.forName("com.mysql.cj.jdbc.Driver");

        try (final Connection connection = DriverManager.getConnection(
                "jdbc:mysql://" + host + ":" + port + "/" + databaseName + "?useSSL=true&serverTimezone=UTC", userName,
                password);
                final Statement statement = connection.createStatement();
                final BufferedReader reader = new BufferedReader(new FileReader(schemaFilePath))) {

            System.out.println("✓ Connected to database: " + databaseName);

            StringBuilder sql = new StringBuilder();
            String line;
            int statementCount = 0;

            while ((line = reader.readLine()) != null) {
                line = line.trim();

                // Skip empty lines and comments
                if (line.isEmpty() || line.startsWith("--")) {
                    continue;
                }

                sql.append(line).append(" ");

                // Execute when statement ends with semicolon
                if (line.endsWith(";")) {
                    String sqlStatement = sql.toString().trim();
                    if (!sqlStatement.isEmpty()) {
                        try {
                            statement.execute(sqlStatement);
                            statementCount++;
                            System.out.println("✓ [" + statementCount + "] Executed: "
                                    + sqlStatement.substring(0, Math.min(50, sqlStatement.length())) + "...");
                        } catch (SQLException e) {
                            System.out.println("✗ Error executing: " + sqlStatement);
                            e.printStackTrace();
                        }
                    }
                    sql = new StringBuilder();
                }
            }

            System.out.println("\n✓ Schema created successfully! (" + statementCount + " statements executed)");

        } catch (Exception e) {
            System.out.println("✗ Connection or file read failure.");
            e.printStackTrace();
        }
    }
}
